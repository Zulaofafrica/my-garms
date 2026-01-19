
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log('Connecting to database...');
  // Force use of POSTGRES_URL, or DATABASE_URL as fallback
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('No connection string found in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    console.log('Connected successfully.');

    try {
      // Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('customer', 'designer')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        `);
      console.log('Created "users" table');

      // Profiles Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            measurements JSONB NOT NULL DEFAULT '{}'
        );
        `);
      console.log('Created "profiles" table');

      // Orders Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            status TEXT NOT NULL,
            total NUMERIC,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            data JSONB NOT NULL DEFAULT '{}'
        );
        `);
      console.log('Created "orders" table');

    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

main();
