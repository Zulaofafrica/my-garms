
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, readCollection, DbUser, DbOrder } from '@/lib/db';

// GET /api/designer/requests - List requests (shortlisted for this designer)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await findById<DbUser>('users', session.userId);
        if (!user || (user.role !== 'designer' && user.role !== 'admin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const allOrders = await readCollection<DbOrder>('orders');

        // Filter for orders where this designer is shortlisted AND status is open for assignment
        const requests = allOrders.filter(order =>
            order.assignmentStatus === 'shortlisted' &&
            (user.role === 'admin' || order.shortlistedDesignerIds?.includes(user.id))
        );

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Designer requests list error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
