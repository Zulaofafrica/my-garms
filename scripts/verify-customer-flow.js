
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

                // Handle quoted values
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                process.env[key] = value;
            }
        });
    } else {
        console.warn("No .env or .env.local found!");
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
        console.log("Starting Verification of Customer Flow (Standalone)...");

        const now = new Date().toISOString();
        const randomSuffix = Math.floor(Math.random() * 100000);

        // 1. Create a Test Designer with "Suit" specialty
        const designerId = `test_designer_${randomSuffix}`;
        const designerEmail = `designer_${randomSuffix}@test.com`;

        await pool.query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [designerId, designerEmail, 'hash', 'Test', 'Designer', 'designer', now]
        );

        const profileId = `dp_${randomSuffix}`;
        await pool.query(
            `INSERT INTO designer_profiles (id, user_id, specialties, skill_level, max_capacity, current_load, rating, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [profileId, designerId, JSON.stringify(['suit']), 'premium', 5, 0, 5.0, 'available', now, now]
        );
        console.log("Created Test Designer with 'Suit' specialty.");

        // 2. Simulate Order Data (from Wizard)
        const orderId = `order_${randomSuffix}`;
        const userId = `guest_${randomSuffix}`;
        const userEmail = `guest_${randomSuffix}@test.com`;

        await pool.query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, userEmail, 'hash', 'Guest', 'User', 'customer', now]
        );

        const orderData = {
            category: 'suit',
            complexity: 'detailed',
            urgency: 'standard',
            style: 'formal',
            templateName: 'Suit - Formal',
            fabricName: 'Client Fabric',
            images: ['http://test.com/image.jpg'],
            fabricSource: 'own',
            paymentStatus: 'pending'
        };

        await pool.query(`
            INSERT INTO orders (id, user_id, status, total, created_at, updated_at, data) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            orderId,
            userId,
            'pending',
            0,
            now,
            now,
            JSON.stringify(orderData)
        ]);
        console.log("Created Test Order.");

        // 3. Verify Saved Data
        const { rows } = await pool.query(`SELECT data FROM orders WHERE id = $1`, [orderId]);
        const savedData = rows[0].data;

        console.log("Saved Order Data:", JSON.stringify(savedData, null, 2));

        if (savedData.category !== 'suit') throw new Error("Category not saved!");
        if (savedData.complexity !== 'detailed') throw new Error("Complexity not saved!");
        if (savedData.urgency !== 'standard') throw new Error("Urgency not saved!");

        console.log("✅ DB verified: New fields are saved correctly.");

        // 4. Test Matching Logic Query
        const checkMatch = await pool.query(`
            SELECT * FROM designer_profiles 
            WHERE status = 'available'
            AND current_load < max_capacity
            AND specialties::text ILIKE '%suit%'
            AND skill_level = 'premium' 
        `);

        if (checkMatch.rows.length > 0) {
            console.log("✅ Matching Logic Verification: Found eligible designer (Manual Query Check).");
        } else {
            console.log("❌ Matching Logic Verification: Failed to find designer (Manual Query Check).");
        }

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    } finally {
        await pool.end();
        console.log("Done.");
    }
}

run();
