
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbUser } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/designer/requests/[id]/accept
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

        const result = await MatchingService.assignOrder(id, user.id);

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        await import('@/lib/db').then(m => m.logAudit(user.id, 'designer.request_accept', `Designer accepted order #${id}`, id));

        return NextResponse.json({
            success: true,
            message: 'Order accepted successfully'
        });

        // Audit Log (Post-response or await before? Await before is safer for consistency)
        // Wait, function returns. Need to insert before return.

    } catch (error) {
        console.error('Accept request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
