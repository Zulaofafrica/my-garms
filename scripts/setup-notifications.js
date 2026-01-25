
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function setupNotifications() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        console.log("Setting up Notification System tables...");

        // 1. Ensure Notifications Table (User In-App Notifications)
        // Note: This might already exist from previous setups, but ensuring schema consistency.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Verified 'notifications' table.");

        // 2. Create Email Queue Table (Async Email Processing)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_queue (
                id TEXT PRIMARY KEY,
                recipient TEXT NOT NULL,
                subject TEXT NOT NULL,
                html_body TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                attempts INTEGER DEFAULT 0,
                next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                error TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP WITH TIME ZONE
            );
        `);
        console.log("✅ Verified 'email_queue' table.");

        // 3. Add Indices for Performance
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_email_queue_next_attempt ON email_queue(next_attempt_at);`);
        console.log("✅ Indices created.");

    } catch (err) {
        console.error("Error setting up notifications:", err);
    } finally {
        await pool.end();
    }
}

setupNotifications();
