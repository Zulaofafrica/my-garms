import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, generateId, DbUser, DbOrder, FeedbackEntry } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/designer/orders/[id]/feedback - Add feedback and update status
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
        const { action, comment, price, attachmentUrl } = body;

        if (!action || !comment) {
            return NextResponse.json({ error: 'Action and comment are required' }, { status: 400 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Check if designer can provide feedback (must be assigned or unassigned but pending)
        if (order.assignedDesignerId && order.assignedDesignerId !== user.id) {
            return NextResponse.json({ error: 'Order assigned to another designer' }, { status: 403 });
        }

        // Determine new status based on action
        let newStatus = order.status;
        let newPrice = order.price;

        if (action === 'set_price') {
            if (price === undefined) {
                return NextResponse.json({ error: 'Price is required for set_price action' }, { status: 400 });
            }
            newPrice = price;
            newStatus = 'reviewing'; // Stays in reviewing or moves to reviewing when price is set
        } else if (action === 'suggest_edit') {
            newStatus = 'reviewing';
        } else if (action === 'request_change') {
            newStatus = 'changes_requested';
        }

        // Create feedback entry
        const feedbackEntry: FeedbackEntry = {
            id: generateId(),
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            action,
            comment,
            attachmentUrl,
            timestamp: new Date().toISOString(),
        };

        // Update order
        const updates: Partial<DbOrder> = {
            status: newStatus,
            price: newPrice,
            assignedDesignerId: user.id, // Assign to this designer if not already
            feedbackLog: [...(order.feedbackLog || []), feedbackEntry],
            updatedAt: new Date().toISOString(),
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        return NextResponse.json({
            order: updatedOrder,
            message: 'Feedback submitted successfully',
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
