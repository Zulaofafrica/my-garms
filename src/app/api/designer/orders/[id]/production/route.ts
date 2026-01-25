import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbUser, DbOrder } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/designer/orders/[id]/production - Update production stage
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
        const { stage, estimatedDate, startDate, endDate } = body;

        // Validation: Cannot move to 'in_transit' if not full payment
        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (stage === 'in_transit' && order.paymentStatus !== 'paid_100') {
            return NextResponse.json({ error: 'Cannot ship items without full payment.' }, { status: 400 });
        }

        const updates: Partial<DbOrder> = {
            productionStage: stage,
            updatedAt: new Date().toISOString(),
        };

        if (estimatedDate) updates.estimatedCompletionDate = estimatedDate;
        if (startDate) updates.productionStartDate = startDate;
        if (endDate) updates.productionEndDate = endDate;

        if (stage === 'in_transit') {
            updates.status = 'shipping';
        } else if (stage === 'delivered') {
            updates.status = 'delivered';
        }

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        // Notify Customer
        try {
            const { NotificationService } = await import('@/lib/notification-service');
            const stageLabels: Record<string, string> = {
                'sewing': 'Sewing in progress',
                'finishing': 'Finishing touches',
                'ready_for_delivery': 'Ready for delivery',
                'in_transit': 'Out for delivery',
                'delivered': 'Delivered'
            };
            const label = stageLabels[stage] || stage;

            await NotificationService.notify(
                order.userId,
                'order_update',
                `Update on Order #${order.id.slice(0, 8)}: ${label}`,
                {
                    to: 'customer@example.com',
                    subject: `Order Update: ${label}`,
                    htmlBody: `<p>Your order is now: <strong>${label}</strong></p>`
                }
            );
        } catch (e) { console.error("Notify error", e); }

        return NextResponse.json({
            order: updatedOrder,
            message: 'Production stage updated',
        });
    } catch (error) {
        console.error('Production update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
