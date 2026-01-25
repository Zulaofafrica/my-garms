
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, generateId, DbOrder, FeedbackEntry, DbUser } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/feedback - Customer Reply
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { action, comment } = body;

        if (!action || !comment || action !== 'reply') {
            return NextResponse.json({ error: 'Invalid feedback data' }, { status: 400 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership and get user details
        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await findById<DbUser>('users', session.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create feedback entry
        const feedbackEntry: FeedbackEntry = {
            id: generateId(),
            userId: session.userId,
            userName: `${user.firstName} ${user.lastName}`,
            action,
            comment,
            timestamp: new Date().toISOString(),
        };

        // Update order
        const updates: Partial<DbOrder> = {
            feedbackLog: [...(order.feedbackLog || []), feedbackEntry],
            updatedAt: new Date().toISOString()
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        // Notify Designer if assigned
        if (order.assignedDesignerId) {
            const { NotificationService } = await import('@/lib/notification-service');
            await NotificationService.notify(
                order.assignedDesignerId,
                'order_update',
                `New feedback from ${user.firstName} on Order #${order.id.slice(0, 8)}`,
                {
                    to: 'designer@example.com',
                    subject: 'New Customer Feedback',
                    htmlBody: `<p>Customer says: "${comment}"</p>`
                }
            );
        }

        return NextResponse.json({
            order: updatedOrder,
            message: 'Reply sent successfully',
        });
    } catch (error) {
        console.error('Feedback reply error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
