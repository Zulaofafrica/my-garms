
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function createDesigner() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connectionString) { console.error("No connection string"); process.exit(1); }

    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        const email = 'designer@test.com';
        const password = 'password123';
        // Use bcrypt to match login route!
        const pHash = await bcrypt.hash(password, 10);
        const userId = 'designer_' + Date.now();

        // Check if exists first to avoid dupes or delete old one
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            console.log("Designer 'designer@test.com' already exists. Updating password...");
            await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [pHash, email]);

            const existingId = check.rows[0].id;
            // Ensure profile exists
            const profCheck = await pool.query('SELECT id FROM designer_profiles WHERE user_id = $1', [existingId]);
            if (profCheck.rows.length === 0) {
                console.log("Creating missing designer profile...");
                await pool.query(`
                INSERT INTO designer_profiles (id, user_id, specialties, skill_level, max_capacity, current_load, rating, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             `, ['dp_' + existingId, existingId, JSON.stringify(['dresses']), 'advanced', 10, 0, 5.0, 'available']);
            }
            console.log("Designer updated.");
            return;
        }

        // 1. Create User
        console.log("Creating user...");
        await pool.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [userId, email, pHash, 'Test', 'Designer', 'designer']);

        // 2. Create Designer Profile
        console.log("Creating designer profile...");
        await pool.query(`
      INSERT INTO designer_profiles (id, user_id, specialties, skill_level, max_capacity, current_load, rating, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
            'dp_' + userId,
            userId,
            JSON.stringify(['dresses', 'suits', 'native']),
            'advanced',
            10,
            0,
            5.0,
            'available'
        ]);

        console.log(`Designer created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error("Error creating designer:", err);
    } finally {
        await pool.end();
    }
}

createDesigner();
