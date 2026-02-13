
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbUser } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/designer/requests/[id]/decline
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

        await MatchingService.declineOrder(id, user.id);

        await import('@/lib/db').then(m => m.logAudit(user.id, 'designer.request_decline', `Designer declined order #${id}`, id));

        return NextResponse.json({
            success: true,
            message: 'Request declined'
        });
    } catch (error) {
        console.error('Decline request error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
