
import { NextResponse } from 'next/server';
import { findById, updateOne, logAudit, DbOrder } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id } = await params;
        const body = await request.json();
        const { resolution } = body; // e.g. "Refunded customer", "Upheld designer claim"

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution details required' }, { status: 400 });
        }

        const updatedOrder = await updateOne<DbOrder>('orders', id, {
            disputeStatus: 'resolved',
            disputeResolution: resolution
        });

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await logAudit(
            'admin',
            'resolve_dispute',
            `Super Admin resolved dispute for order ${id}: ${resolution}`,
            id
        );

        return NextResponse.json({ success: true, message: 'Dispute resolved' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
