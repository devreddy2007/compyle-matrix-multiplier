import { query } from '../../config/database';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export const createUser = async (email: string, password: string): Promise<User> => {
  const password_hash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (email, password_hash, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     RETURNING id, email, password_hash, created_at, updated_at`,
    [email, password_hash]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const verifyPassword = async (password: string, password_hash: string): Promise<boolean> => {
  return bcrypt.compare(password, password_hash);
};
