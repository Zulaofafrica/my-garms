
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { readCollection, DbDispute } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // In a real app with high volume, we'd add pagination and filtering to the Service/DB layer.
        // For MVP, reading all disputes and filtering in memory is acceptable as per readCollection design.
        const allDisputes = await readCollection<DbDispute>('disputes');

        // Sort by CreatedAt descending
        const sorted = allDisputes.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ success: true, disputes: sorted });
    } catch (error: any) {
        console.error('Error fetching admin disputes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
