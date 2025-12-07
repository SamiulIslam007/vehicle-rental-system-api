import { pool } from "../../config/db";
import { AppError } from "../../middlewares/error";

const createVehicleIntoDB = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const checkQuery = `SELECT id FROM vehicles WHERE registration_number = $1`;
  const checkResult = await pool.query(checkQuery, [
    registration_number as string,
  ]);

  if (checkResult.rows.length > 0) {
    throw new AppError("Registration number already exists", 400);
  }

  const query = `
    INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
    VALUES($1, $2, $3, $4, $5)
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
  `;

  const result = await pool.query(query, [
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status || "available",
  ]);

  const vehicle = result.rows[0];
  return {
    id: Number(vehicle.id),
    vehicle_name: vehicle.vehicle_name,
    type: vehicle.type,
    registration_number: vehicle.registration_number,
    daily_rent_price: Number(vehicle.daily_rent_price),
    availability_status: vehicle.availability_status,
  };
};

const getAllVehiclesFromDB = async () => {
  const query = `
    SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    FROM vehicles
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);
  return result.rows.map((row) => ({
    id: Number(row.id),
    vehicle_name: row.vehicle_name,
    type: row.type,
    registration_number: row.registration_number,
    daily_rent_price: Number(row.daily_rent_price),
    availability_status: row.availability_status,
  }));
};

const getVehicleByIdFromDB = async (vehicleId: number) => {
  const query = `
    SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status
    FROM vehicles
    WHERE id = $1
  `;

  const result = await pool.query(query, [vehicleId]);

  if (result.rows.length === 0) {
    throw new AppError("Vehicle not found", 404);
  }

  const vehicle = result.rows[0];
  return {
    id: Number(vehicle.id),
    vehicle_name: vehicle.vehicle_name,
    type: vehicle.type,
    registration_number: vehicle.registration_number,
    daily_rent_price: Number(vehicle.daily_rent_price),
    availability_status: vehicle.availability_status,
  };
};

const updateVehicleIntoDB = async (
  vehicleId: number,
  payload: Record<string, unknown>
) => {
  const checkQuery = `SELECT id, registration_number FROM vehicles WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [vehicleId]);

  if (checkResult.rows.length === 0) {
    throw new AppError("Vehicle not found", 404);
  }

  const existingVehicle = checkResult.rows[0];

  if (
    payload.registration_number &&
    payload.registration_number !== existingVehicle.registration_number
  ) {
    const regCheckQuery = `SELECT id FROM vehicles WHERE registration_number = $1`;
    const regCheckResult = await pool.query(regCheckQuery, [
      payload.registration_number as string,
    ]);

    if (regCheckResult.rows.length > 0) {
      throw new AppError("Registration number already exists", 400);
    }
  }

  const updateFields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (payload.vehicle_name) {
    updateFields.push(`vehicle_name = $${paramCount++}`);
    values.push(payload.vehicle_name);
  }
  if (payload.type) {
    updateFields.push(`type = $${paramCount++}`);
    values.push(payload.type);
  }
  if (payload.registration_number) {
    updateFields.push(`registration_number = $${paramCount++}`);
    values.push(payload.registration_number);
  }
  if (payload.daily_rent_price) {
    updateFields.push(`daily_rent_price = $${paramCount++}`);
    values.push(payload.daily_rent_price);
  }
  if (payload.availability_status) {
    updateFields.push(`availability_status = $${paramCount++}`);
    values.push(payload.availability_status);
  }

  if (updateFields.length === 0) {
    return await getVehicleByIdFromDB(vehicleId);
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(vehicleId);

  const query = `
    UPDATE vehicles
    SET ${updateFields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status
  `;

  const result = await pool.query(query, values);
  const vehicle = result.rows[0];
  return {
    id: Number(vehicle.id),
    vehicle_name: vehicle.vehicle_name,
    type: vehicle.type,
    registration_number: vehicle.registration_number,
    daily_rent_price: Number(vehicle.daily_rent_price),
    availability_status: vehicle.availability_status,
  };
};

const deleteVehicleFromDB = async (vehicleId: number) => {
  const checkQuery = `
    SELECT v.id, COUNT(b.id) as active_bookings
    FROM vehicles v
    LEFT JOIN bookings b ON v.id = b.vehicle_id AND b.status = 'active'
    WHERE v.id = $1
    GROUP BY v.id
  `;

  const checkResult = await pool.query(checkQuery, [vehicleId]);

  if (checkResult.rows.length === 0) {
    throw new AppError("Vehicle not found", 404);
  }

  if (parseInt(checkResult.rows[0].active_bookings) > 0) {
    throw new AppError("Cannot delete vehicle with active bookings", 400);
  }

  const deleteQuery = `DELETE FROM vehicles WHERE id = $1`;
  await pool.query(deleteQuery, [vehicleId]);
};

export const vehicleServices = {
  createVehicleIntoDB,
  getAllVehiclesFromDB,
  getVehicleByIdFromDB,
  updateVehicleIntoDB,
  deleteVehicleFromDB,
};
