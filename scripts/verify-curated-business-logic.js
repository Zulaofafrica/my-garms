
const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Manually load .env for DB connection
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

const BASE_URL = 'http://localhost:3000/api';

async function runVerification() {
    console.log('Starting Curated Design Business Logic Verification...');
    const suffix = Math.floor(Math.random() * 100000);
    const password = 'password123';
    const designerEmail = `des_logic_${suffix}@test.com`;
    const designerId = `des_logic_${suffix}`;

    try {
        // 1. Create Designer in DB
        // Use bcrypt hash for 'password123' or just hijack the session logic?
        // Actually, API login requires bcrypt check. 
        // We can create a user via API first? No, requires admin.
        // We can just INSERT a user with a KNOWN hash.
        // Hash for 'password' is usually involved. 
        // ALTERNATIVE: Mock the session. 
        // But easier: Create a user via valid API flow? No public signup for designers.
        // OK, I'll allow the script to assume a known hash for 'password' exists or use a simpler login bypass?
        // No bypass.
        // Use a hash.
        const knownHash = '$2b$10$EpWaTgi/F.sMqv/Z7.ZcTO6g6w.Q3ow.W3ow.W3ow.W3ow'; // Placeholder, won't work.
        // Actually, we can just insert the user and then NOT login, but manually set the session cookie?
        // But we don't know the secret to sign the cookie.

        // Let's use the 'verify-full-system' approach? It didn't login.

        // NEW PLAN: 
        // 1. Insert User.
        // 2. Insert Order.
        // 3. Since we can't easily login via API without hashing lib support in this script (unless we npm install bcrypt),
        //    we will just verify the logic by running a SQL query that mimics the route?
        //    NO, that defeats the purpose of verifying the CODE.

        // BETTER: We DO have `bcryptjs` in the project `node_modules`. We can require it.
        const bcrypt = require('bcryptjs'); // Assuming it's installed in root
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(`INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [designerId, designerEmail, hashedPassword, 'Logic', 'Tester', 'designer', new Date().toISOString()]
        );

        // Create Profile
        await pool.query(`INSERT INTO designer_profiles (id, user_id, status, created_at, updated_at) VALUES ($1, $2, 'available', $3, $4)`,
            [`dp_logic_${suffix}`, designerId, new Date().toISOString(), new Date().toISOString()]
        );
        console.log('✅ Created Designer:', designerEmail);

        // 2. Login via API
        let cookieHeader = '';
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: designerEmail,
                password: password
            });
            const cookies = loginRes.headers['set-cookie'];
            if (cookies) {
                cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
                console.log('✅ Logged in successfully');
            } else {
                console.error('❌ Login failed: No cookies');
                return;
            }
        } catch (e) {
            console.error('❌ Login failed:', e.message);
            return;
        }

        // 2.5 Create Guest User & Profile for the order owner
        await pool.query(`INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING`,
            ['guest_123', `guest_${suffix}@test.com`, 'hash', 'Guest', 'User', 'customer', new Date().toISOString()]
        );
        await pool.query(`INSERT INTO profiles (id, user_id, name, gender, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
            ['prof_123', 'guest_123', 'Guest', 'male', new Date().toISOString(), new Date().toISOString()]
        );

        // 3. Create Curated Order (via DB to skip Wizard complexity)
        const orderId = `ord_curated_${suffix}`;
        const price = 105000; // 105k
        const deliveryDetails = JSON.stringify({ address: 'test' });

        // Pack extra fields into data JSON
        const curatedData = JSON.stringify({
            profileId: 'prof_123',
            category: 'Suit',
            style: 'Curated Style',
            paymentStatus: 'paid_100',
            price: price,
            assignedDesignerId: designerId,
            deliveryDetails: { address: 'test' }
        });

        // Insert with template_id relevant columns + data
        await pool.query(`
            INSERT INTO orders (
                id, user_id, status, total, 
                template_id, template_name,
                created_at, updated_at, data
            ) VALUES (
                $1, $2, 'delivered', $3, 
                'tmp_123', 'Curated Template',
                NOW(), NOW(), $4
            )
        `, [orderId, 'guest_123', price, curatedData]);

        console.log('✅ Created Curated Order (Delivered status)');

        // 4. Create Standard Order (for comparison)
        const stdOrderId = `ord_std_${suffix}`;
        const stdPrice = 105000;

        const stdData = JSON.stringify({
            profileId: 'prof_123',
            category: 'Suit',
            style: 'Standard Style',
            paymentStatus: 'paid_100',
            price: stdPrice,
            assignedDesignerId: designerId
        });

        await pool.query(`
            INSERT INTO orders (
                id, user_id, status, total, 
                created_at, updated_at, data
            ) VALUES (
                $1, $2, 'delivered', $3, 
                NOW(), NOW(), $4
            )
        `, [stdOrderId, 'guest_123', stdPrice, stdData]);
        console.log('✅ Created Standard Order (Delivered status)');

        // 5. Check Finance
        // Expected:
        // Curated: (105000 - 5000) * 0.20 = 100,000 * 0.20 = 20,000
        // Standard: (105000 - 5000) * 0.15 = 100,000 * 0.15 = 15,000
        // Total Accrued: 35,000

        const financeRes = await axios.get(`${BASE_URL}/designer/finance`, {
            headers: { Cookie: cookieHeader }
        });

        const { accrued } = financeRes.data;
        console.log('💰 Accrued Commission:', accrued);

        if (accrued === 35000) {
            console.log('✅ Commission Calculation Verified! (20% for Curated, 15% for Standard)');
        } else {
            console.error(`❌ Unexpected Commission: ${accrued}. Expected 35000.`);
            // Debug breakdown
            console.log('Details:', financeRes.data);
        }

    } catch (err) {
        console.error('❌ Script Error:', err);
    } finally {
        await pool.end();
    }
}

// Check paths for required modules
const modules = ['axios', 'pg', 'bcryptjs'];
let missing = false;
modules.forEach(m => {
    try { require.resolve(m); } catch (e) {
        console.error(`Missing module: ${m}. Please run 'npm install ${m}'`);
        missing = true;
    }
});

if (!missing) {
    runVerification();
}
