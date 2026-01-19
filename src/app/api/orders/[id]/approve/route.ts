import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbOrder } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/approve - Customer approves the order price/design
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const order = await findById<DbOrder>('orders', id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (order.price === null) {
            return NextResponse.json({ error: 'Cannot approve order without a set price' }, { status: 400 });
        }

        const updates: Partial<DbOrder> = {
            status: 'confirmed',
            updatedAt: new Date().toISOString(),
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        return NextResponse.json({
            order: updatedOrder,
            message: 'Order approved successfully',
        });
    } catch (error) {
        console.error('Order approval error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
