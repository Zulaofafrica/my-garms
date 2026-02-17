import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbUser, DbOrder } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!['shipped', 'received'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const user = await findById<DbUser>('users', session.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Authorization:
        // - 'shipped': Only customers (who own the order)
        // - 'received': Only assigned designer
        if (status === 'shipped') {
            if (order.userId !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } else if (status === 'received') {
            if (user.role !== 'designer' || order.assignedDesignerId !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const updatedOrder = await updateOne<DbOrder>('orders', id, {
            fabricStatus: status,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Fabric status update error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
