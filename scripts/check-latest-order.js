
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkOrder() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        const res = await pool.query(`
        SELECT id, status, data 
        FROM orders 
        ORDER BY created_at DESC 
        LIMIT 1
    `);
        const row = res.rows[0];
        console.log("Order ID:", row.id);
        console.log("Status:", row.status);
        console.log("Assignment Data:", {
            assignedDesignerId: row.data.assignedDesignerId,
            assignmentStatus: row.data.assignmentStatus,
            shortlisted: row.data.shortlistedDesignerIds
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkOrder();
