import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, readCollection, DbUser, DbOrder } from '@/lib/db';

// GET /api/designer/orders - List orders for designers
// If a designer is logged in, they see:
// 1. Orders assigned to them
// 2. Pending orders that are not yet assigned
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const allOrders = await readCollection<DbOrder>('orders');

        // Filter orders for the designer
        // Only show orders explicitly assigned to this designer
        const designerOrders = allOrders.filter(order =>
            order.assignedDesignerId === user.id
        );

        // Sort by date (newest first)
        designerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ orders: designerOrders });
    } catch (error) {
        console.error('Designer orders fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
