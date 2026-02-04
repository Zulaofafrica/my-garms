
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
            // Audit Logs Table
            await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            user_email TEXT,
            action TEXT NOT NULL,
            resource_id TEXT,
            details TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        `);
            console.log('Created "audit_logs" table');

        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error setting up audit logs table:', err);
    } finally {
        await pool.end();
    }
}

main();
