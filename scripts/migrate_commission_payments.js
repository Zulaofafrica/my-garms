
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
        console.log('Starting migration for commission_payments...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS commission_payments (
                id TEXT PRIMARY KEY,
                designer_id TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                proof_url TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, declined
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Index for faster lookups by designer
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_commission_payments_designer 
            ON commission_payments(designer_id);
        `);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

runMigration();
