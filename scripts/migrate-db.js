
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env
try {
    let envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        envPath = path.resolve(__dirname, '../.env.local');
    }
    if (fs.existsSync(envPath)) {
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
} catch (e) { }

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        console.log("Running migration...");

        await pool.query(`
            ALTER TABLE designer_profiles 
            ADD COLUMN IF NOT EXISTS profile_photo TEXT;
        `);
        console.log("Added profile_photo column.");

        await pool.query(`
            ALTER TABLE designer_profiles 
            ADD COLUMN IF NOT EXISTS portfolio_samples JSONB DEFAULT '[]';
        `);
        console.log("Added portfolio_samples column.");

        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
    }
}

runMigration();
