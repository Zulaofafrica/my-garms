
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, findByField, DbOrder, DbDesignerProfile } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/rate - Customer rates the designer
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { rating, review } = body;

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid rating (1-5)' }, { status: 400 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (order.status !== 'delivered') {
            return NextResponse.json({ error: 'Order must be delivered before rating' }, { status: 400 });
        }

        if (order.rating) {
            return NextResponse.json({ error: 'Order already rated' }, { status: 400 });
        }

        const updates: Partial<DbOrder> = {
            rating: rating,
            review: review || '',
            updatedAt: new Date().toISOString(),
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        // Update Designer Profile Stats
        if (order.assignedDesignerId) {
            const designerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', order.assignedDesignerId);

            if (designerProfile) {
                const currentRating = designerProfile.rating || 0;
                const currentCount = designerProfile.reviewCount || 0;

                // Calculate new average
                // (OldAvg * OldCount + NewRating) / (OldCount + 1)
                const newCount = currentCount + 1;
                const totalScore = (currentRating * currentCount) + rating;
                const newRating = Number((totalScore / newCount).toFixed(1)); // Keep 1 decimal

                await updateOne<DbDesignerProfile>('designer_profiles', designerProfile.id, {
                    rating: newRating,
                    reviewCount: newCount,
                    updatedAt: new Date().toISOString()
                });
            }

            // Notify Designer
            // Notify Designer
            try {
                const { NotificationService } = await import('@/lib/notification-service');
                await NotificationService.notify(
                    order.assignedDesignerId,
                    'order_update',
                    `You received a ${rating}-star rating for Order #${order.id.slice(0, 8)}!`,
                    {
                        to: 'designer@example.com', // Placeholder, service handles lookup
                        subject: 'New Customer Rating',
                        htmlBody: `<p>Great work! You received a new rating.</p><p><strong>Rating:</strong> ${rating}/5 Stars</p><p><strong>Review:</strong> ${review || 'No comment'}</p>`
                    }
                );
            } catch (notifyErr) {
                console.error("Failed to notify designer of rating:", notifyErr);
                // Don't fail the request if notification fails
            }
        }

        return NextResponse.json({
            order: updatedOrder,
            message: 'Rating submitted successfully',
        });
    } catch (error) {
        console.error('Rating submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
