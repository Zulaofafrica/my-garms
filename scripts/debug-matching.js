
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

async function run() {
    try {
        console.log("--- Debugging Matching Logic ---");

        // 1. Get Users and Profiles
        const { rows: designers } = await pool.query(`SELECT * FROM designer_profiles`);
        console.log(`Found ${designers.length} designer profiles.`);
        designers.forEach(d => {
            console.log(`- ID: ${d.id}, UserID: ${d.user_id}, Status: ${d.status}, Load: ${d.current_load}/${d.max_capacity}, Specialties: ${d.specialties}, Skill: ${d.skill_level}`);
        });

        // 2. Get Recent Order (The one failing)
        // Ensure accurate retrieval by getting the latest order
        const { rows: orders } = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 1`);
        if (orders.length === 0) {
            console.log("No orders found.");
            return;
        }
        const order = orders[0];
        // Parse data column as it contains details
        // Note: db.ts `mapOrder` spreads `data`. `data` is usually JSON but text in DB?
        // Let's print raw.
        console.log("\nLatest Order:");
        console.log(`- ID: ${order.id}`);
        console.log(`- Category: ${order.data?.category || order.category}`); // Check both locations
        console.log(`- Style: ${order.data?.style || order.style || order.template_name}`);
        console.log(`- Complexity: ${order.data?.complexity || order.complexity}`);
        console.log(`- TemplateID: ${order.template_id}`);
        console.log("Order Data JSON:", order.data);

        // 3. Simulate Matching Logic Logic
        console.log("\nSimulating Match:");
        const eligible = designers.filter(d => {
            let pass = true;
            console.log(`Testing Designer ${d.id}:`);

            // Status
            if (d.status !== 'available') {
                console.log(`  x Status is ${d.status}`);
                pass = false;
            }

            // Load
            if (d.current_load >= d.max_capacity) {
                console.log(`  x Over capacity`);
                pass = false;
            }

            // Category Match (Strict)
            // Need to parse specialties if string
            let specs = [];
            try {
                specs = typeof d.specialties === 'string' ? JSON.parse(d.specialties) : d.specialties;
            } catch (e) { specs = [d.specialties]; }

            const orderCat = order.data?.category || 'Suit'; // Default assumption for test

            // Check
            const hasCat = specs.some(s => {
                const spec = s.toLowerCase();
                const oCat = orderCat.toLowerCase();
                return oCat.includes(spec) || spec.includes(oCat);
            });

            if (!hasCat) {
                // Try fallback
                const title = order.template_name || '';
                const hasTitle = specs.some(s => title.toLowerCase().includes(s.toLowerCase()));
                if (!hasTitle) {
                    console.log(`  x Category mismatch. Order: ${orderCat}, Designer: ${JSON.stringify(specs)}`);
                    pass = false;
                } else {
                    console.log(`  OK (Title Match)`);
                }
            } else {
                console.log(`  OK (Category Match)`);
            }

            return pass;
        });

        console.log(`\nEligible Designers Count: ${eligible.length}`);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
