
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env vars manually from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        // Skip empty lines or comments
        if (!line || line.startsWith('#')) return;

        // Split on first = only
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            let value = valueParts.join('=');

            // Remove surrounding quotes if present
            value = value.trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            process.env[key.trim()] = value;
        }
    });
}

// Fallback: If DATABASE_URL is somehow missing but POSTGRES_URL exists
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration for curated_designs...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS curated_designs (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        style_aesthetic VARCHAR(100),
        description TEXT,
        base_price_range VARCHAR(100),
        complexity_level VARCHAR(50),
        designer_skill_level VARCHAR(50),
        default_fabric VARCHAR(255),
        images JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT false,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
