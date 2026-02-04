
import { findById, updateOne, DbOrder } from '../src/lib/db';

async function main() {
    try {
        const orderId = '1770192237055_5sv6sggiv'; // The problematic order from diag
        console.log(`Fixing order ${orderId}...`);

        const order = await findById<DbOrder>('orders', orderId);
        if (!order) {
            console.error('Order not found');
            return;
        }

        console.log('Current status:', order.assignmentStatus);
        console.log('Current shortlist:', order.shortlistedDesignerIds);

        await updateOne<DbOrder>('orders', orderId, {
            assignmentStatus: 'shortlisted',
            // Keep shortlist as is
        });

        console.log('Order status reset to shortlisted.');
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
