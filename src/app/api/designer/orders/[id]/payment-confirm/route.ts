import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbUser, DbOrder } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/designer/orders/[id]/payment-confirm - Confirm payment
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!['paid_70', 'paid_100'].includes(status)) {
            return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Logic: If status becomes paid, we can move or keep production status
        // If it was already in production, nothing changes.
        // If this is the initial payment, we might set productionStage to 'design_approved' if not set.

        let newProductionStage = order.productionStage;
        if (!newProductionStage) {
            newProductionStage = 'design_approved';
        }

        const updates: Partial<DbOrder> = {
            paymentStatus: status,
            productionStage: newProductionStage,
            updatedAt: new Date().toISOString(),
            status: 'sewing', // Move overall status to sewing/production phase
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        return NextResponse.json({
            order: updatedOrder,
            message: 'Payment confirmed successfully',
        });
    } catch (error) {
        console.error('Payment confirm error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
