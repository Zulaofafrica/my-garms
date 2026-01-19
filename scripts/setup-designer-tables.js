
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("No connection string found in .env.local");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Creating designer_profiles table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS designer_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        specialties JSONB DEFAULT '[]',
        skill_level VARCHAR(50),
        max_capacity INTEGER DEFAULT 5,
        current_load INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Add index on user_id for faster lookups
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_designer_profiles_user_id ON designer_profiles(user_id);
    `);

        // Add index on status for matching queries
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_designer_profiles_status ON designer_profiles(status);
    `);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
