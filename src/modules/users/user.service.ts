import { pool } from "../../config/db";
import { AppError } from "../../middlewares/error";

const getAllUsersFromDB = async () => {
  const query = `
    SELECT id, name, email, phone, role
    FROM users
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

const updateUserIntoDB = async (
  userId: number,
  payload: Record<string, unknown>,
  currentUserId: number,
  currentUserRole: string
) => {
  // Check if user exists
  const checkQuery = `SELECT id, email FROM users WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [userId]);

  if (checkResult.rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  const existingUser = checkResult.rows[0];

  // If customer is trying to update, they can only update themselves
  if (currentUserRole === "customer" && currentUserId !== userId) {
    throw new AppError("You can only update your own profile", 403);
  }

  // If customer is trying to update role, prevent it
  if (currentUserRole === "customer" && payload.role) {
    throw new AppError("You cannot change your role", 403);
  }

  // Check if email is being updated and already exists
  if (payload.email && payload.email !== existingUser.email) {
    const emailCheckQuery = `SELECT id FROM users WHERE email = $1`;
    const emailCheckResult = await pool.query(emailCheckQuery, [
      payload.email as string,
    ]);

    if (emailCheckResult.rows.length > 0) {
      throw new AppError("Email already exists", 400);
    }
  }

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (payload.name) {
    updateFields.push(`name = $${paramCount++}`);
    values.push(payload.name);
  }
  if (payload.email) {
    updateFields.push(`email = $${paramCount++}`);
    values.push(payload.email);
  }
  if (payload.phone) {
    updateFields.push(`phone = $${paramCount++}`);
    values.push(payload.phone);
  }
  if (payload.role) {
    updateFields.push(`role = $${paramCount++}`);
    values.push(payload.role);
  }

  if (updateFields.length === 0) {
    // No fields to update, return existing user
    const query = `
      SELECT id, name, email, phone, role
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const query = `
    UPDATE users
    SET ${updateFields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING id, name, email, phone, role
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteUserFromDB = async (userId: number) => {
  // Check if user exists and has active bookings
  const checkQuery = `
    SELECT u.id, COUNT(b.id) as active_bookings
    FROM users u
    LEFT JOIN bookings b ON u.id = b.customer_id AND b.status = 'active'
    WHERE u.id = $1
    GROUP BY u.id
  `;

  const checkResult = await pool.query(checkQuery, [userId]);

  if (checkResult.rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  if (parseInt(checkResult.rows[0].active_bookings) > 0) {
    throw new AppError("Cannot delete user with active bookings", 400);
  }

  const deleteQuery = `DELETE FROM users WHERE id = $1`;
  await pool.query(deleteQuery, [userId]);
};

export const userServices = {
  getAllUsersFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
};
