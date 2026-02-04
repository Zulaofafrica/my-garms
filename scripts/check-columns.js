
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

async function check() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders'
        `);
        console.log('Columns in orders table:', res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
