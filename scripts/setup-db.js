
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const client = await db.connect();

    try {
        // Users Table
        await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('customer', 'designer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Created "users" table');

        // Profiles Table
        await client.sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        measurements JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Created "profiles" table');

        // Orders Table
        // We store complex nested fields (feedbackLog, images, etc.) in a JSONB 'data' column
        // to preserve flexibility while keeping core fields relational for querying.
        await client.sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        status TEXT NOT NULL,
        total NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data JSONB NOT NULL DEFAULT '{}'
      );
    `;
        console.log('Created "orders" table');

    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await client.end();
    }
}

main();
