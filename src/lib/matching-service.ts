
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
        // 1. Base Pool: Available + Capacity
        const availableDesigners = await findAllByField<DbDesignerProfile>('designer_profiles', 'status', 'available');
        let basePool = availableDesigners.filter(d => d.currentLoad < d.maxCapacity);
        console.log(`Matching: ${basePool.length} designers available with capacity`);

        if (basePool.length === 0) return [];

        // 2. Category Filter (Hard Requirement)
        if (order.category) {
            const orderCat = order.category.toLowerCase();
            basePool = basePool.filter(d => d.specialties.some(s => {
                const spec = s.toLowerCase();
                return orderCat.includes(spec) || spec.includes(orderCat);
            }));
            console.log(`Matching: ${basePool.length} matched category '${orderCat}'`);
        } else if (order.templateName && order.templateName !== 'custom-template') {
            const term = order.templateName.toLowerCase();
            basePool = basePool.filter(d => d.specialties.some(s => s.toLowerCase().includes(term)));
        }

        if (basePool.length === 0) {
            console.warn("Matching: No designers matched category, returning empty.");
            return [];
        }

        // 3. Define Matchers
        const matchesStyle = (d: DbDesignerProfile) =>
            order.style ? d.specialties.includes(order.style) : true;

        const matchesComplexity = (d: DbDesignerProfile) => {
            if (!order.complexity) return true;
            if (order.complexity === 'simple') return true;
            if (order.complexity === 'moderate') return d.skillLevel !== 'basic';
            if (order.complexity === 'detailed') return d.skillLevel === 'premium';
            return true;
        };

        // 4. Tiered Selection
        // Tier 1: Perfect Match (Style + Complexity)
        const perfectMatches = basePool.filter(d => matchesStyle(d) && matchesComplexity(d));
        if (perfectMatches.length > 0) {
            console.log(`Matching: Found ${perfectMatches.length} perfect matches`);
            return this.sortDesigners(perfectMatches);
        }

        // Tier 2: Style Match (Ignore Complexity)
        // We prioritize Style (Aesthetics) over Complexity (Skill) for the MVP, 
        // assuming "Basic" designers can maybe attempt "Moderate" work or user prefers the look.
        const styleMatches = basePool.filter(d => matchesStyle(d));
        if (styleMatches.length > 0) {
            console.log(`Matching: Fallback to ${styleMatches.length} style matches (ignoring complexity)`);
            return this.sortDesigners(styleMatches);
        }

        // Tier 3: Complexity Match (Ignore Style)
        const complexityMatches = basePool.filter(d => matchesComplexity(d));
        if (complexityMatches.length > 0) {
            console.log(`Matching: Fallback to ${complexityMatches.length} complexity matches (ignoring style)`);
            return this.sortDesigners(complexityMatches);
        }

        // Tier 4: Base Pool (Category Only)
        console.log(`Matching: Fallback to ${basePool.length} category matches`);
        return this.sortDesigners(basePool);
    }

    private static sortDesigners(designers: DbDesignerProfile[]) {
        return designers.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating; // High rating first
            return a.currentLoad - b.currentLoad; // Lower load first
        });
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
            NotificationService.notify(
                dId,
                'request_received',
                `New Design Request: ${order.templateName || 'Custom Outfit'} is available for you.`,
                {
                    to: 'designer@example.com', // In real app, fetch designer email
                    subject: 'New Design Opportunity on MyGarms',
                    htmlBody: `<p>A new request matches your profile.</p><a href="https://mygarms.com/designer">View Dashboard</a>`
                }
            )
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
        await NotificationService.notify(
            order.userId,
            'order_update',
            `Great news! Your order is now being designed by a specialist.`,
            {
                to: 'customer@example.com', // Fetch user email in real app
                subject: 'Designer Assigned to Your Order',
                htmlBody: `<p>Your order #${order.id.slice(0, 8)} has been assigned.</p>`
            }
        );

        // Notify Designer (Confirmation)
        await NotificationService.notify(
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
