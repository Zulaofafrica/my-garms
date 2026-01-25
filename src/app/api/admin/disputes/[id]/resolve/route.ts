
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { DisputeService } from '@/lib/dispute-service';
import { getCurrentUser } from '@/lib/session';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: disputeId } = await params;

    // Check if user is admin
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Need admin ID for audit log.
    const user = await getCurrentUser();
    const adminId = user?.id || 'admin_system_user'; // fallback

    try {
        const body = await request.json();
        const { resolution, notes, status } = body;

        if (!resolution) {
            return NextResponse.json({ error: 'Resolution is required' }, { status: 400 });
        }

        await DisputeService.resolveDispute(
            disputeId,
            adminId,
            resolution,
            notes || '',
            status || 'RESOLVED'
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error resolving dispute:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
