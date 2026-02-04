import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbOrder, updateOne } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';
import { NotificationService } from '@/lib/notification-service';

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
        const { method, designerId } = body; // method: 'auto' | 'manual'

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (order.assignmentStatus === 'shortlisted' || order.assignmentStatus === 'assigned') {
            return NextResponse.json({ error: 'Order already processing assignment' }, { status: 400 });
        }

        if (method === 'auto') {
            // Trigger Auto Matching (Shortlist top N)
            const success = await MatchingService.shortlistDesigners(id);
            if (!success) {
                return NextResponse.json({ error: 'Failed to find designers' }, { status: 404 });
            }
        } else if (method === 'manual') {
            if (!designerId) {
                return NextResponse.json({ error: 'Designer ID required for manual selection' }, { status: 400 });
            }

            // Verify designer is eligible/exists
            // For MVP: Trust ID, but in real app verify against eligible list again

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await updateOne<DbOrder>('orders', id, {
                assignmentStatus: 'shortlisted',
                shortlistedDesignerIds: [designerId],
                assignmentExpiresAt: expiresAt.toISOString()
            });

            // Notify Designer
            await NotificationService.notify(
                designerId,
                'request_received',
                `You have been hand-picked for a new design request: ${order.templateName}.`,
                {
                    to: 'designer@example.com',
                    subject: 'You were selected for a Job!',
                    htmlBody: `<p>A customer explicitly chose you for their request.</p>`
                }
            );
        } else {
            return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Selection confirmed' });

    } catch (error) {
        console.error('Assignment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
