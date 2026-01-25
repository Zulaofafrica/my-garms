
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { DisputeService } from '@/lib/dispute-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'designer') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const disputes = await DisputeService.getDisputesForDesigner(user.id);
        return NextResponse.json({ success: true, disputes });
    } catch (error: any) {
        console.error('Error fetching designer disputes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
