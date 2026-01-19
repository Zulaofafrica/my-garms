import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbOrder } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/payment - Submit payment proof
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { paymentType, proofUrl } = body;

        const order = await findById<DbOrder>('orders', id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const validStatuses = ['confirmed', 'sewing', 'shipping'];
        // Allow payment if confirmed (initial) or if in production/shipping (balance payment)
        if (!validStatuses.includes(order.status)) {
            return NextResponse.json({ error: 'Order not eligible for payment yet. Please wait for design approval.' }, { status: 400 });
        }

        const updates: Partial<DbOrder> = {
            paymentStatus: paymentType === 'full' ? 'verify_100' : 'verify_70',
            paymentType,
            proofUrl,
            updatedAt: new Date().toISOString(),
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        return NextResponse.json({
            order: updatedOrder,
            message: 'Payment proof submitted successfully',
        });
    } catch (error) {
        console.error('Payment submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
