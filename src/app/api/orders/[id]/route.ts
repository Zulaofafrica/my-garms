
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbOrder } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

        // Check ownership (or if user is admin/designer - though this is a customer-facing route primarily)
        // For now, strict ownership check for customers.
        // Designers access via /api/designer/orders/[id] usually, but let's see. 
        // If designer is assigned, they might need access too? 
        // For now, let's allow if userId matches.

        if (order.userId !== session.userId) {
            // Check if user is admin (optional, for flexibility)
            // But let's keep it simple for now. 
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
