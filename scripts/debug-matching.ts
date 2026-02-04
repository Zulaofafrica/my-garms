
import { findById, DbOrder } from '../src/lib/db';
import { MatchingService } from '../src/lib/matching-service';

async function main() {
    try {
        const orderId = '1770194745320_c36hldobo';
        console.log(`Debugging matching for order ${orderId}...`);

        const order = await findById<DbOrder>('orders', orderId);
        if (!order) {
            console.error('Order not found');
            return;
        }

        console.log('Order Details:', {
            category: order.category,
            style: order.style,
            complexity: order.complexity
        });

        const designers = await MatchingService.findEligibleDesigners(order);
        console.log(`Found ${designers.length} eligible designers.`);

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
