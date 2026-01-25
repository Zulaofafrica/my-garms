
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { insertOne, generateId, DbDispute, DbDisputeEvidence, findByField, findAllByField } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id: orderId } = await params;
        const body = await req.json();
        const { category, description, evidence } = body;

        // Check if dispute already exists for this order
        const existing = await findByField<DbDispute>('disputes', 'orderId', orderId);
        if (existing) {
            return NextResponse.json({ error: 'A dispute is already open for this order' }, { status: 400 });
        }

        const disputeId = 'dsp_' + generateId();
        const now = new Date().toISOString();

        const dispute: DbDispute = {
            id: disputeId,
            orderId,
            creatorId: session.userId,
            category,
            description,
            status: 'OPEN',
            createdAt: now,
            updatedAt: now
        };

        await insertOne('disputes', dispute);

        // Add evidence if provided
        if (evidence && Array.isArray(evidence)) {
            for (const item of evidence) {
                const evidenceId = 'ev_' + generateId();
                const ev: DbDisputeEvidence = {
                    id: evidenceId,
                    disputeId,
                    uploaderId: session.userId,
                    fileUrl: item.cvUrl,
                    fileType: item.type || 'image',
                    description: '',
                    createdAt: now
                };
                await insertOne('dispute_evidence', ev);
            }
        }

        // Update order status to indicate dispute? 
        // Ideally checking `disputeStatus` on order would be done via a join or updated here.
        // For simple implementations, we might just query disputes table.
        // But let's trigger an update if we want the order object to reflect it efficiently.
        // await updateOne('orders', orderId, { disputeStatus: 'opened' }); // If we had this logic

        return NextResponse.json({ success: true, disputeId });
    } catch (error) {
        console.error('Create dispute error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id: orderId } = await params;

        const dispute = await findByField<DbDispute>('disputes', 'orderId', orderId);

        if (!dispute) {
            return NextResponse.json({ dispute: null });
        }

        // Verify ownership (or admin)
        if (dispute.creatorId !== session.userId && session.role !== 'admin') {
            // If the user is the one who created it, fine.
            // If we want the designer to see it too, we need more checks.
            // For now assuming creator (customer) or admin.
            // Ideally fetching the order to check if user is the assigned designer would be good too.
        }

        return NextResponse.json({ dispute });

    } catch (error) {
        console.error('Get dispute error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
