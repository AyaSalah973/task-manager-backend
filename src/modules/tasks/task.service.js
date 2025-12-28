const pool = require("../../config/database");
exports.getAll = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  const tasksResult = await pool.query(
    `SELECT id, title, description, status, created_at 
     FROM tasks 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM tasks WHERE user_id = $1",
    [userId]
  );
  
  const total = parseInt(countResult.rows[0].count);
  
  return {
    tasks: tasksResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

exports.create = async (userId, { title, description }) => {
  if (!title || title.trim() === '') {
    throw new Error("Title is required");
  }
  
  const result = await pool.query(
    `INSERT INTO tasks (user_id, title, description) 
     VALUES ($1, $2, $3) 
     RETURNING id, title, description, status, created_at`,
    [userId, title, description || null]
  );
  
  return result.rows[0];
};

exports.update = async (userId, taskId, { title, description, status }) => {
  const checkResult = await pool.query(
    "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
    [taskId, userId]
  );
  
  if (checkResult.rows.length === 0) {
    throw new Error("Task not found or unauthorized");
  }
    const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(title);
  }
  
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description || null);
  }
  
  if (status !== undefined) {
    const validStatuses = ['pending', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status value");
    }
    updates.push(`status = $${paramCount++}`);
    values.push(status);
  }
  
  if (updates.length === 0) {
    throw new Error("No fields to update");
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  
  values.push(taskId, userId);
  
  const query = `
    UPDATE tasks 
    SET ${updates.join(', ')} 
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING id, title, description, status, created_at, updated_at
  `;
  
  console.log("Update Query:", query);
  console.log("Update Values:", values);
  
  const result = await pool.query(query, values);
  
  return result.rows[0];
};

exports.remove = async (userId, taskId) => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
    [taskId, userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Task not found or unauthorized");
  }
  
  return result.rows[0];
};