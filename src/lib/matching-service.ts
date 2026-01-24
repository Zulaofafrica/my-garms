
import {
    findById,
    findAllByField,
    findByField,
    updateOne,
    DbOrder,
    DbDesignerProfile
} from './db';
import { NotificationService } from './notification-service';

const SHORTLIST_SIZE = 3;
const EXPIRATION_HOURS = 24;

export class MatchingService {

    /**
     * Finds eligible designers for an order
     * MVP Logic:
     * 1. Status is 'available'
     * 2. Current Load < Max Capacity
     * 3. (Optional) Skill level matches order complexity (assumed 'basic' for now)
     * 4. (Optional) Specialty matches order type
     */
    static async findEligibleDesigners(order: DbOrder): Promise<DbDesignerProfile[]> {
        // 1. Get all available designers
        const availableDesigners = await findAllByField<DbDesignerProfile>('designer_profiles', 'status', 'available');

        // 2. Filter by Capacity
        let eligible = availableDesigners.filter(d => d.currentLoad < d.maxCapacity);

        // 3. Filter by Category (Strict)
        if (order.category) {
            eligible = eligible.filter(d => d.specialties.some(s => s === order.category));
        } else if (order.templateName && order.templateName !== 'custom-template') {
            // Fallback for legacy/other orders
            const term = order.templateName.toLowerCase();
            eligible = eligible.filter(d => d.specialties.some(s => s.toLowerCase().includes(term)));
        }

        // 4. Filter by Style (Refinement - Prefer Style Match)
        if (order.style && eligible.length > 0) {
            const styleMatches = eligible.filter(d => d.specialties.includes(order.style!));
            if (styleMatches.length > 0) {
                console.log(`Refined matches by style ${order.style}: ${styleMatches.length} designers`);
                eligible = styleMatches;
            }
        }

        // 5. Filter by Complexity (Skill Level)
        // simple -> basic+, moderate -> advanced+, detailed -> premium
        if (order.complexity) {
            eligible = eligible.filter(d => {
                if (order.complexity === 'simple') return true; // Everyone can do simple
                if (order.complexity === 'moderate') return d.skillLevel !== 'basic';
                if (order.complexity === 'detailed') return d.skillLevel === 'premium';
                return true;
            });
        }

        // 6. Sort by Rating (desc) and Load (asc)
        eligible.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return a.currentLoad - b.currentLoad;
        });

        return eligible;
    }

    /**
     * Triggers the shortlisting process for an order
     */
    static async shortlistDesigners(orderId: string): Promise<boolean> {
        const order = await findById<DbOrder>('orders', orderId);
        if (!order) return false;

        // Don't re-shortlist if already assigned or completed
        if (order.assignmentStatus === 'assigned' || order.assignmentStatus === 'completed') {
            return false;
        }

        const eligible = await this.findEligibleDesigners(order);

        if (eligible.length === 0) {
            console.warn(`No eligible designers found for order ${orderId}`);
            // Could set status to 'pending_admin' or just leave open
            return false;
        }

        // Pick top N
        const shortlisted = eligible.slice(0, SHORTLIST_SIZE);
        const shortlistedIds = shortlisted.map(d => d.userId);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + EXPIRATION_HOURS);

        await updateOne<DbOrder>('orders', orderId, {
            assignmentStatus: 'shortlisted',
            shortlistedDesignerIds: shortlistedIds,
            assignmentExpiresAt: expiresAt.toISOString()
        });

        // Notify Designers
        // note: In prod, queue this. For MVP, await in parallel.
        await Promise.all(shortlistedIds.map(dId =>
            NotificationService.send(dId, 'request_received', `New Design Request: ${order.templateName || 'Custom Outfit'} is available for you.`)
        ));

        console.log(`Shortlisted ${shortlisted.length} designers for order ${orderId}`);
        return true;
    }

    /**
     * Assigns a designer to an order (Accept Flow)
     */
    static async assignOrder(orderId: string, designerUserId: string): Promise<{ success: boolean; message: string }> {
        const order = await findById<DbOrder>('orders', orderId);
        if (!order) return { success: false, message: 'Order not found' };

        if (order.assignmentStatus === 'assigned') {
            return { success: false, message: 'Order already assigned' };
        }

        if (order.assignmentExpiresAt && new Date(order.assignmentExpiresAt) < new Date()) {
            return { success: false, message: 'Assignment offer expired' };
        }

        // Check availability again (race condition check)
        const designerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', designerUserId) as DbDesignerProfile | null;
        // NOTE: findByField for 'designer_profiles' was updated to handle 'userId' in db.ts? 
        // I need to check db.ts if I added that case. I added 'status', but maybe not 'userId' unique lookup.
        // Actually I added: "if (collection === 'designer_profiles' && field === 'userId')" in findByField. Yes.

        if (!designerProfile) {
            return { success: false, message: 'Designer profile not found' };
        }

        if (designerProfile.currentLoad >= designerProfile.maxCapacity) {
            return { success: false, message: 'You have reached maximum capacity' };
        }

        // Perform Assignment
        // 1. Update Order
        await updateOne<DbOrder>('orders', orderId, {
            assignedDesignerId: designerUserId,
            assignmentStatus: 'assigned',
            shortlistedDesignerIds: [], // Clear shortlist
            status: 'reviewing' // Move to reviewing stage immediately? Or 'pending' but with designer?
            // Existing flow uses 'pending' initially. 'reviewing' implies price setting.
            // Let's set to 'pending' but assigned.
        });

        // 2. Update Designer Load
        await updateOne<DbDesignerProfile>('designer_profiles', designerProfile.id, {
            currentLoad: designerProfile.currentLoad + 1
        });

        // Notify Customer
        await NotificationService.send(
            order.userId,
            'order_update',
            `Great news! Your order is now being designed by a specialist.`
        );

        // Notify Designer (Confirmation)
        await NotificationService.send(
            designerUserId,
            'system',
            `You have been assigned to Order #${order.id.slice(0, 8)}. Please review details.`
        );

        return { success: true, message: 'Order assigned successfully' };
    }

    /**
     * Designer declines an order
     */
    static async declineOrder(orderId: string, designerUserId: string): Promise<boolean> {
        const order = await findById<DbOrder>('orders', orderId);
        if (!order || !order.shortlistedDesignerIds) return false;

        const newShortlist = order.shortlistedDesignerIds.filter(id => id !== designerUserId);

        await updateOne<DbOrder>('orders', orderId, {
            shortlistedDesignerIds: newShortlist
        });

        // Trigger re-shortlisting if list becomes empty? 
        // For MVP, just remove.

        return true;
    }
}
