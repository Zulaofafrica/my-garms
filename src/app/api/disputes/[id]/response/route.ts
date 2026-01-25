
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { DisputeService } from '@/lib/dispute-service';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: disputeId } = await params;

    const user = await getCurrentUser();
    if (!user || user.role !== 'designer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action, comment, evidence } = body;

        // Valid actions: ACCEPT, REJECT, COUNTER
        if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!comment) {
            return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
        }

        await DisputeService.respondToDispute(
            disputeId,
            user.id,
            action,
            comment,
            evidence || []
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error responding to dispute:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
