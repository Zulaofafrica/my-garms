const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDisputes() {
    try {
        console.log('Starting Disputes Table Setup...');

        // Create Disputes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS disputes (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL REFERENCES orders(id),
                creator_id TEXT NOT NULL REFERENCES users(id),
                category TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'OPEN', -- OPEN, RESPONSE_REQUIRED, RESOLVED, CLOSED
                resolution TEXT,
                admin_notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Disputes table created/verified');

        // Create Dispute Evidence Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dispute_evidence (
                id TEXT PRIMARY KEY,
                dispute_id TEXT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
                uploader_id TEXT NOT NULL REFERENCES users(id),
                file_url TEXT NOT NULL,
                file_type TEXT, -- 'image', 'video'
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Dispute Evidence table created/verified');

        // Add indices for performance
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_disputes_creator_id ON disputes(creator_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);`);
        console.log('✅ Indices created');

    } catch (error) {
        console.error('❌ Error setting up dispute tables:', error);
    } finally {
        await pool.end();
    }
}

setupDisputes();
