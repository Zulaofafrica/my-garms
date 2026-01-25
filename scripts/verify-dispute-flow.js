
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function verifyDisputeFlow() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    const runId = Math.floor(Math.random() * 10000);
    const userId = `u_test_${runId}`;
    const designerId = `d_test_${runId}`;
    const orderId = `o_test_${runId}`;
    const disputeId = `dp_test_${runId}`;
    const userEmail = `user${runId}@example.com`;

    try {
        console.log(`Starting Verification Run: ${runId}`);

        // 1. Setup Data
        await pool.query(`INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, 'hash', 'Test', 'User', 'customer')`, [userId, userEmail]);
        await pool.query(`INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES ($1, $2, 'hash', 'Test', 'Designer', 'designer')`, [designerId, `designer${runId}@example.com`]);
        await pool.query(`INSERT INTO orders (id, user_id, status, total, data) VALUES ($1, $2, 'delivered', 50000, '{}')`, [orderId, userId]);
        console.log('✅ Setup Users and Order');

        // 2. Create Dispute (Customer)
        await pool.query(`
            INSERT INTO disputes (id, order_id, creator_id, category, description, status) 
            VALUES ($1, $2, $3, 'Fit Issue', 'Too tight', 'OPEN')
        `, [disputeId, orderId, userId]);

        await pool.query(`
            INSERT INTO dispute_evidence (id, dispute_id, uploader_id, file_url, file_type)
            VALUES ($1, $2, $3, 'http://img.com/badfit.jpg', 'image')
        `, [`ev_${runId}_1`, disputeId, userId]);

        console.log('✅ Created Dispute');

        // Verify Status
        const d1 = await pool.query('SELECT * FROM disputes WHERE id = $1', [disputeId]);
        if (d1.rows[0].status !== 'OPEN') throw new Error('Status should be OPEN');

        // 3. Designer Response
        await pool.query(`
            UPDATE disputes SET status = 'RESPONSE_REQUIRED', admin_notes = '[Designer]: I followed measurements' 
            WHERE id = $1
        `, [disputeId]);
        console.log('✅ Designer Responded');

        // 4. Admin Resolve
        await pool.query(`
             UPDATE disputes SET status = 'RESOLVED', resolution = 'Refund 50%', admin_notes = admin_notes || '\n[Admin]: refunding'
             WHERE id = $1
        `, [disputeId]);

        await pool.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [orderId]); // Simulating side effect manual or auto
        console.log('✅ Admin Resolved');

        // Final Check
        const dFinal = await pool.query('SELECT * FROM disputes WHERE id = $1', [disputeId]);
        console.log('Final Dispute State:', dFinal.rows[0]);

        // Cleanup
        await pool.query('DELETE FROM dispute_evidence WHERE dispute_id = $1', [disputeId]);
        await pool.query('DELETE FROM disputes WHERE id = $1', [disputeId]);
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
        await pool.query('DELETE FROM users WHERE id IN ($1, $2)', [userId, designerId]);
        console.log('✅ Cleanup Complete');

    } catch (err) {
        console.error('❌ Verification Failed:', err);
    } finally {
        await pool.end();
    }
}

verifyDisputeFlow();
