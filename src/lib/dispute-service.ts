
import {
    DbDispute,
    DbDisputeEvidence,
    DbOrder,
    insertOne,
    findById,
    findByField,
    findAllByField,
    readCollection,
    updateOne,
    generateId,
    logAudit
} from './db';

export class DisputeService {

    /**
     * Create a new dispute for an order
     */
    static async createDispute(
        orderId: string,
        creatorId: string,
        category: string,
        description: string,
        evidenceFiles: { cvUrl: string, type: string, description?: string }[] = []
    ): Promise<DbDispute | null> {
        // Validate Order Exists
        const order = await findById<DbOrder>('orders', orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Validate if dispute already exists
        const existingDispute = await findByField<DbDispute>('disputes', 'orderId', orderId);
        if (existingDispute && existingDispute.status !== 'CLOSED') {
            throw new Error('An active dispute already exists for this order');
        }

        // Create Dispute
        const dispute: DbDispute = {
            id: generateId(),
            orderId,
            creatorId,
            category,
            description,
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await insertOne('disputes', dispute);

        // Add Evidence
        for (const file of evidenceFiles) {
            await insertOne<DbDisputeEvidence>('dispute_evidence', {
                id: generateId(),
                disputeId: dispute.id,
                uploaderId: creatorId,
                fileUrl: file.cvUrl,
                fileType: file.type,
                description: file.description || '',
                createdAt: new Date().toISOString()
            });
        }

        // Update Order Status (Optional: Mark as Disputed)
        await updateOne<DbOrder>('orders', orderId, { disputeStatus: 'opened' });

        await logAudit(creatorId, 'CREATE_DISPUTE', `Created dispute for order ${orderId}`, dispute.id);

        return dispute;
    }

    /**
     * Get dispute details with evidence
     */
    static async getDisputeDetails(disputeId: string) {
        const dispute = await findById<DbDispute>('disputes', disputeId);
        if (!dispute) return null;

        const evidence = await findAllByField<DbDisputeEvidence>('dispute_evidence', 'disputeId', disputeId);

        return { ...dispute, evidence };
    }

    /**
     * Get active dispute for an order
     */
    static async getOrderDispute(orderId: string) {
        const dispute = await findByField<DbDispute>('disputes', 'orderId', orderId);
        if (!dispute) return null;

        const evidence = await findAllByField<DbDisputeEvidence>('dispute_evidence', 'disputeId', dispute.id);
        return { ...dispute, evidence };
    }

    /**
     * Designer response to dispute
     */
    static async respondToDispute(
        disputeId: string,
        designerId: string,
        action: 'ACCEPT' | 'REJECT' | 'COUNTER',
        comment: string,
        evidenceFiles: { cvUrl: string, type: string }[] = []
    ) {
        const dispute = await findById<DbDispute>('disputes', disputeId);
        if (!dispute) throw new Error('Dispute not found');

        // Logic for state transition based on response
        // For simplicity: If Designer Accepts -> Go to RESOLVED (Pending Admin confirmation logic maybe, or auto-resolve)
        // If Reject/Counter -> Remain OPEN or go to MEDIATION needed status. 
        // Let's use 'RESPONSE_REQUIRED' to mean "Waiting on other party" or similar.
        // Or keep it simple: Just log the interaction and update status if needed.

        // Update status to indicate Designer has responded
        // If ACCEPT, maybe we can move to a state where Admin just needs to process refund/fix.
        // If REJECT, Admin needs to intervene.

        // Let's just update timestamp and maybe status if it was NEW
        await updateOne<DbDispute>('disputes', disputeId, {
            status: 'RESPONSE_REQUIRED', // Signal to Admin that both sides have spoken? Or just keep OPEN.
            adminNotes: dispute.adminNotes ? `${dispute.adminNotes}\n[Designer]: ${comment}` : `[Designer]: ${comment}`
        });

        // Add Counter Evidence
        for (const file of evidenceFiles) {
            await insertOne<DbDisputeEvidence>('dispute_evidence', {
                id: generateId(),
                disputeId: dispute.id,
                uploaderId: designerId,
                fileUrl: file.cvUrl,
                fileType: file.type,
                description: 'Designer Response Evidence',
                createdAt: new Date().toISOString()
            });
        }

        await logAudit(designerId, 'RESPOND_DISPUTE', `Responded to dispute ${disputeId} with ${action}`, disputeId);
    }

    /**
     * Admin resolves the dispute
     */
    static async resolveDispute(
        disputeId: string,
        adminId: string,
        resolution: string,
        notes: string,
        status: 'RESOLVED' | 'CLOSED' = 'RESOLVED'
    ) {
        const dispute = await findById<DbDispute>('disputes', disputeId);
        if (!dispute) throw new Error('Dispute not found');

        await updateOne<DbDispute>('disputes', disputeId, {
            status,
            resolution,
            adminNotes: notes,
        });

        // Update Order if resolved
        if (status === 'RESOLVED') {
            await updateOne<DbOrder>('orders', dispute.orderId, { disputeStatus: 'resolved', disputeResolution: resolution });
        }

        await logAudit(adminId, 'RESOLVE_DISPUTE', `Resolved dispute ${disputeId} with ${resolution}`, disputeId);
    }

    /**
     * Get all disputes relevant to a designer (where they are the assigned designer on the order)
     */
    static async getDisputesForDesigner(designerId: string): Promise<(DbDispute & { order?: DbOrder })[]> {
        // 1. Get all orders assigned to this designer
        // This relies on the convention that we can query orders.
        // Since we don't have a direct query for filtering orders by ID list in findAllByField easily without loop,
        // we might get all orders for designer first.

        // This is a bit inefficient without true SQL join support in our Db abstraction, but acceptable for MVP.
        const orders = await findAllByField<DbOrder>('orders', 'assignedDesignerId', designerId); // This might not work if 'assignedDesignerId' is in JSON?
        // Wait, 'assignedDesignerId' is in the `data` column JSON in the DB schema, but mapped to top level in DbOrder interface.
        // `findByField` and `findAllByField` implementation:
        // if (collection === 'orders') ... `mapOrder` expands `data`.
        // But `findAllByField` implementation for 'orders' only explicitly handles 'userId'.
        // It falls back to `readCollection` and filter in JS if not specialized.
        // Check `findAllByField` implementation in db.ts:
        // It has specific cases. It DOES NOT have a case for `assignedDesignerId`.
        // So it reads ALL orders and filters in JS. That's fine for now.

        const designerOrders = orders.filter(o => o.assignedDesignerId === designerId);
        const orderIds = new Set(designerOrders.map(o => o.id));

        // 2. Get all disputes
        const allDisputes = await readCollection<DbDispute>('disputes');

        // 3. Filter disputes that match order IDs
        const pertinentDisputes = allDisputes.filter(d => orderIds.has(d.orderId));

        // 4. Attach simple order info for UI convenience
        return pertinentDisputes.map(d => ({
            ...d,
            order: designerOrders.find(o => o.id === d.orderId)
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}
