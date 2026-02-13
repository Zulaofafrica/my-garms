const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('No database connection string found in .env.local');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Creating addresses table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS addresses (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL, 
                label TEXT NOT NULL,
                full_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Check columns in DbUser just in case (address, state)
        console.log('Checking users table for address columns...');
        await pool.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
        `);

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
