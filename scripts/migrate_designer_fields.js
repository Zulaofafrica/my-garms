
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        console.log('Starting migration...');

        // 1. Add fields to designer_profiles
        console.log('Updating designer_profiles table...');
        await pool.query(`
            ALTER TABLE designer_profiles 
            ADD COLUMN IF NOT EXISTS bank_name TEXT,
            ADD COLUMN IF NOT EXISTS account_number TEXT,
            ADD COLUMN IF NOT EXISTS account_name TEXT,
            ADD COLUMN IF NOT EXISTS workshop_address TEXT,
            ADD COLUMN IF NOT EXISTS phone_number TEXT,
            ADD COLUMN IF NOT EXISTS identification_url TEXT;
        `);

        // 2. Add commission_paid to orders
        console.log('Updating orders table...');
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE;
        `);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
