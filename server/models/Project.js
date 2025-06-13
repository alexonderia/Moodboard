import pool from '../db.js';

export async function getProjectsByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE user_id = $1',
    [userId]
  );
  return rows;
}

export async function createProject({ userId, title, preview = null, data = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO projects (user_id, title, preview, data)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, title, preview, data]
  );
  return rows[0];
}

export async function getProjectById(id, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return rows[0];
}

export async function updateProject({ id, userId, title, preview, data }) {
  const { rows } = await pool.query(
    `UPDATE projects
     SET title = $1,
         preview = $2,
         data = $3,
         updated_at = NOW()
     WHERE id = $4 AND user_id = $5
     RETURNING *`,
    [title, preview, data, id, userId]
  );

  return rows[0] || null;
}

export async function deleteProject(id, userId) {
  await pool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
}
