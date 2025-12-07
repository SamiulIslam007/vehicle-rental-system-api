import { pool } from '../../config/db';
import { AppError } from '../../middlewares/error';

// Helper function to calculate days between dates
const calculateDays = (startDate: Date, endDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to check and auto-return expired bookings
export const checkAndAutoReturnBookings = async () => {
  const now = new Date().toISOString().split('T')[0];

  // Find expired active bookings
  const expiredQuery = `
    SELECT id, vehicle_id
    FROM bookings
    WHERE status = 'active' AND rent_end_date < $1
  `;

  const expiredResult = await pool.query(expiredQuery, [now]);

  // Update expired bookings to returned
  for (const booking of expiredResult.rows) {
    await pool.query(
      `UPDATE bookings SET status = 'returned', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [booking.id]
    );

    // Update vehicle availability
    await pool.query(
      `UPDATE vehicles SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [booking.vehicle_id]
    );
  }
};

const createBookingIntoDB = async (payload: Record<string, unknown>) => {
  // Check and auto-return expired bookings first
  await checkAndAutoReturnBookings();

  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);

  if (endDate <= startDate) {
    throw new AppError('Rent end date must be after rent start date', 400);
  }

  // Check if customer exists
  const customerQuery = `SELECT id FROM users WHERE id = $1`;
  const customerResult = await pool.query(customerQuery, [
    customer_id as number,
  ]);

  if (customerResult.rows.length === 0) {
    throw new AppError('Customer not found', 404);
  }

  // Check if vehicle exists and is available
  const vehicleQuery = `
    SELECT id, daily_rent_price, availability_status
    FROM vehicles
    WHERE id = $1
  `;
  const vehicleResult = await pool.query(vehicleQuery, [vehicle_id as number]);

  if (vehicleResult.rows.length === 0) {
    throw new AppError('Vehicle not found', 404);
  }

  const vehicle = vehicleResult.rows[0];

  if (vehicle.availability_status === 'booked') {
    throw new AppError('Vehicle is not available for booking', 400);
  }

  // Check for overlapping bookings
  const overlapQuery = `
    SELECT id
    FROM bookings
    WHERE vehicle_id = $1
      AND status = 'active'
      AND (
        (rent_start_date <= $2 AND rent_end_date >= $2)
        OR (rent_start_date <= $3 AND rent_end_date >= $3)
        OR (rent_start_date >= $2 AND rent_end_date <= $3)
      )
  `;

  const overlapResult = await pool.query(overlapQuery, [
    vehicle_id,
    rent_start_date,
    rent_end_date,
  ]);

  if (overlapResult.rows.length > 0) {
    throw new AppError('Vehicle is already booked for this period', 400);
  }

  // Calculate total price
  const numberOfDays = calculateDays(startDate, endDate);
  const totalPrice = parseFloat(vehicle.daily_rent_price) * numberOfDays;

  // Start transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create booking
    const bookingQuery = `
      INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
      VALUES($1, $2, $3, $4, $5, 'active')
      RETURNING id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
    `;

    const bookingResult = await client.query(bookingQuery, [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      totalPrice,
    ]);

    // Update vehicle availability
    await client.query(
      `UPDATE vehicles SET availability_status = 'booked', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [vehicle_id]
    );

    await client.query('COMMIT');

    const booking = bookingResult.rows[0];

    // Get vehicle details for response (after commit, use pool)
    const vehicleDetailsQuery = `
      SELECT vehicle_name, daily_rent_price
      FROM vehicles
      WHERE id = $1
    `;
    const vehicleDetailsResult = await pool.query(vehicleDetailsQuery, [
      vehicle_id,
    ]);

    return {
      ...booking,
      vehicle: vehicleDetailsResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getAllBookingsFromDB = async (userId: number, userRole: string) => {
  // Check and auto-return expired bookings first
  await checkAndAutoReturnBookings();

  if (userRole === 'admin') {
    const query = `
      SELECT 
        b.id,
        b.customer_id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as customer,
        json_build_object(
          'vehicle_name', v.vehicle_name,
          'registration_number', v.registration_number
        ) as vehicle
      FROM bookings b
      INNER JOIN users u ON b.customer_id = u.id
      INNER JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  } else {
    const query = `
      SELECT 
        b.id,
        b.vehicle_id,
        b.rent_start_date,
        b.rent_end_date,
        b.total_price,
        b.status,
        json_build_object(
          'vehicle_name', v.vehicle_name,
          'registration_number', v.registration_number,
          'type', v.type
        ) as vehicle
      FROM bookings b
      INNER JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
};

const updateBookingIntoDB = async (
  bookingId: number,
  status: string,
  userRole: string,
  userId?: number
) => {
  // Check and auto-return expired bookings first
  await checkAndAutoReturnBookings();

  // Get booking details
  const bookingQuery = `
    SELECT b.*, v.id as vehicle_id
    FROM bookings b
    INNER JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = $1
  `;

  const bookingResult = await pool.query(bookingQuery, [bookingId]);

  if (bookingResult.rows.length === 0) {
    throw new AppError('Booking not found', 404);
  }

  const booking = bookingResult.rows[0];

  if (status === 'cancelled') {
    // Only customers can cancel, and only their own bookings
    if (userRole !== 'customer') {
      throw new AppError('Only customers can cancel bookings', 403);
    }

    // Check if customer owns this booking
    if (userId && booking.customer_id !== userId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    const now = new Date();
    const startDate = new Date(booking.rent_start_date);

    if (startDate <= now) {
      throw new AppError('Cannot cancel booking after start date', 400);
    }

    if (booking.status !== 'active') {
      throw new AppError('Only active bookings can be cancelled', 400);
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update booking status
      await client.query(
        `UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      // Update vehicle availability
      await client.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [booking.vehicle_id]
      );

      await client.query('COMMIT');

      // Get updated booking (after commit, use pool)
      const updatedQuery = `
        SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
        FROM bookings
        WHERE id = $1
      `;
      const updatedResult = await pool.query(updatedQuery, [bookingId]);

      return updatedResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else if (status === 'returned') {
    // Only admin can mark as returned
    if (userRole !== 'admin') {
      throw new AppError('Only admins can mark bookings as returned', 403);
    }

    if (booking.status === 'returned') {
      throw new AppError('Booking is already marked as returned', 400);
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update booking status
      await client.query(
        `UPDATE bookings SET status = 'returned', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [bookingId]
      );

      // Update vehicle availability
      await client.query(
        `UPDATE vehicles SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [booking.vehicle_id]
      );

      await client.query('COMMIT');

      // Get updated booking with vehicle info (after commit, use pool)
      const updatedQuery = `
        SELECT 
          b.id,
          b.customer_id,
          b.vehicle_id,
          b.rent_start_date,
          b.rent_end_date,
          b.total_price,
          b.status,
          json_build_object(
            'availability_status', 'available'
          ) as vehicle
        FROM bookings b
        WHERE b.id = $1
      `;
      const updatedResult = await pool.query(updatedQuery, [bookingId]);

      return updatedResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    throw new AppError('Invalid status', 400);
  }
};

export const bookingServices = {
  createBookingIntoDB,
  getAllBookingsFromDB,
  updateBookingIntoDB,
};

