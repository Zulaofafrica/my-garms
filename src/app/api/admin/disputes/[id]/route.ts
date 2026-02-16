import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { findById, findAllByField, DbDispute, DbDisputeEvidence } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const dispute = await findById<DbDispute>('disputes', id);

        if (!dispute) {
            return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
        }

        const evidence = await findAllByField<DbDisputeEvidence>('dispute_evidence', 'disputeId', id);

        return NextResponse.json({
            success: true,
            dispute: {
                ...dispute,
                evidence: evidence || []
            }
        });
    } catch (error: any) {
        console.error('Error fetching dispute details:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
