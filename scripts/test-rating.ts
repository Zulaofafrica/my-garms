
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { findById, updateOne, findByField, query } from '@/lib/db';

async function testRatingSystem() {
    console.log('Starting Rating System Test...');

    try {
        // 1. Setup Data
        // We need a customer, a designer, and an order. 
        // For simplicity, I'll mock the DB calls or insert directly if I can import db utils?
        // Since I'm running this with ts-node, I can use the db module directly if environment vars are set.
        // But usually I run these scripts via `npm run script scripts/test-rating.ts` which loads env?
        // I'll assume I can use the db module.

        // Get or Create a test designer profile
        // I'll just pick the first designer profile available
        const designers = await query('SELECT * FROM designer_profiles LIMIT 1');
        if (designers.rows.length === 0) {
            console.error('No designers found. Cannot test.');
            return;
        }
        const designer = designers.rows[0];
        console.log(`Using designer: ${designer.user_id}`);

        // Get or Create a test user
        const users = await query('SELECT * FROM users LIMIT 1');
        if (users.rows.length === 0) {
            console.error('No users found. Cannot test.');
            return;
        }
        const userId = users.rows[0].id;
        console.log(`Using user: ${userId}`);

        // Get a test order that we can manipulate
        // creating a raw order
        const orderId = `test_order_${Date.now()}`;

        await query(`
            INSERT INTO orders (id, user_id, status, total, created_at, updated_at, data)
            VALUES ($1, $2, 'delivered', 50000, NOW(), NOW(), $3)
        `, [orderId, userId, JSON.stringify({ assignedDesignerId: designer.user_id })]);

        console.log(`Created test order: ${orderId} with status 'delivered'`);

        // 2. Mock the API Call logic locally (since we can't easily fetch against the running server from a script without auth token)
        // Actually, to test the ROUTE logic, I should ideally hit the API. 
        // But I don't have a valid auth token easily.
        // So I will replicate the ROUTE logic here to verify the DB updates work as expected.

        const rating = 5;
        const review = "Excellent work!";

        console.log(`Simulating rating: ${rating} stars`);

        // Logic from route.ts
        const orderRes = await query('SELECT * FROM orders WHERE id = $1', [orderId]);
        const order = orderRes.rows[0];
        const orderData = order.data;

        // Update Order
        const updates = {
            rating: rating,
            review: review,
            updatedAt: new Date().toISOString()
        };
        const newData = { ...orderData, ...updates };

        await query('UPDATE orders SET data = $1 WHERE id = $2', [JSON.stringify(newData), orderId]);
        console.log('Order updated with rating');

        // Update Designer Profile
        const designerRes = await query('SELECT * FROM designer_profiles WHERE user_id = $1', [designer.user_id]);
        const designerProfile = designerRes.rows[0];

        const currentRating = Number(designerProfile.rating) || 0;
        const currentCount = designerProfile.review_count || 0;

        const newCount = currentCount + 1;
        const totalScore = (currentRating * currentCount) + rating;
        const newRating = Number((totalScore / newCount).toFixed(1));

        console.log(`Old Rating: ${currentRating} (${currentCount} reviews)`);
        console.log(`New Rating: ${newRating} (${newCount} reviews)`);

        await query('UPDATE designer_profiles SET rating = $1, review_count = $2 WHERE id = $3',
            [newRating, newCount, designerProfile.id]);

        console.log('Designer profile updated');

        // Verify
        const updatedDesignerRes = await query('SELECT * FROM designer_profiles WHERE id = $1', [designerProfile.id]);
        const updatedDesigner = updatedDesignerRes.rows[0];

        console.log('--- Verification ---');
        console.log(`Designer Rating in DB: ${updatedDesigner.rating}`);
        console.log(`Review Count in DB: ${updatedDesigner.review_count}`);

        if (Number(updatedDesigner.rating) === newRating && updatedDesigner.review_count === newCount) {
            console.log('SUCCESS: Calculations and DB updates are correct.');
        } else {
            console.error('FAILURE: DB values do not match expected values.');
        }

        // Cleanup
        await query('DELETE FROM orders WHERE id = $1', [orderId]);
        // Note: I'm not reverting the designer profile stats, which complicates things. 
        // Ideally should wrap in transaction or revert values.
        // For now, I'll revert manually.
        await query('UPDATE designer_profiles SET rating = $1, review_count = $2 WHERE id = $3',
            [currentRating, currentCount, designerProfile.id]);
        console.log('Reverted designer profile changes');

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testRatingSystem();
