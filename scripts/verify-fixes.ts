
import { findById, DbOrder } from '../src/lib/db';
import { MatchingService } from '../src/lib/matching-service';

// Mock DB session if needed or just call service directly
async function main() {
    try {
        const orderId = '1770194745320_c36hldobo';
        console.log(`Verifying matching for order ${orderId}...`);

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

        designers.forEach(d => {
            console.log(`- ${d.userId} (Style match: ${order.style ? d.specialties.includes(order.style!) : 'N/A'}, Skill: ${d.skillLevel})`);
        });

        if (designers.length > 0) {
            console.log("SUCCESS: Designers found despite complexity mismatch!");
        } else {
            console.error("FAILURE: Still zero designers found.");
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
