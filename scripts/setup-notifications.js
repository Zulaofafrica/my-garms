
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env or .env.local
try {
    let envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        envPath = path.resolve(__dirname, '../.env.local');
    }

    if (fs.existsSync(envPath)) {
        console.log(`Loading env from ${envPath}`);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const firstEqualsIndex = line.indexOf('=');
            if (firstEqualsIndex !== -1) {
                const key = line.substring(0, firstEqualsIndex).trim();
                let value = line.substring(firstEqualsIndex + 1).trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.warn("Could not load .env", e);
}

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Setting up Notifications table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ notifications table created.");
    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        await pool.end();
    }
}

run();
