import pool from '../db.js';
import bcrypt from 'bcryptjs';

export async function createUser({ email, username, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email, username, passwordHash]
    );
    return rows[0];
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  } finally {
    client.release();
  }
}

export async function validatePassword(user, password) {
  return bcrypt.compare(password, user.password);
}
