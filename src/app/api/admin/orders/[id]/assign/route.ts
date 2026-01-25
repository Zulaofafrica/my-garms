
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
        const { designerId } = body;

        if (!designerId) {
            return NextResponse.json({ error: 'Designer ID required' }, { status: 400 });
        }

        const updatedOrder = await updateOne<DbOrder>('orders', id, {
            assignedDesignerId: designerId,
            assignmentStatus: 'assigned'
        });

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await logAudit(
            'admin',
            'assign_designer',
            `Super Admin assigned designer ${designerId} to order ${id}`,
            id
        );

        return NextResponse.json({ success: true, message: 'Designer assigned successfully' });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
