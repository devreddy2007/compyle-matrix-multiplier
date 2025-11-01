import { query } from '../config/database';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
  try {
    const migrationPath = path.join(__dirname, '../../..', 'database/migrations/001_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migrations...');
    await query(migrationSQL);
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigrations();
