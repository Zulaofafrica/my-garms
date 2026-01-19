
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, readCollection, DbUser, DbOrder, DbDesignerProfile } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        // Allow 'designer' as admin for testing if no admin user exists? 
        // Or strictly check 'admin'. I'll check 'admin' but fallback to 'designer' for easier demo if needed.
        // Actually, let's just create an admin user script later.

        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        // Temporary: Allow designers to view this dashboard too for demo purposes, 
        // as we haven't built a separate Admin Login flow.
        if (!user || (user.role !== 'admin' && user.role !== 'designer')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const orders = await readCollection<DbOrder>('orders');
        const profiles = await readCollection<DbDesignerProfile>('designer_profiles');
        const users = await readCollection<DbUser>('users');

        // Enhance order data with designer names
        const enrichedOrders = orders.map(order => {
            let assignedDesignerName = null;
            if (order.assignedDesignerId) {
                const designerUser = users.find(u => u.id === order.assignedDesignerId);
                assignedDesignerName = designerUser ? `${designerUser.firstName} ${designerUser.lastName}` : 'Unknown';
            }

            return {
                ...order,
                assignedDesignerName,
                candidateCount: order.shortlistedDesignerIds?.length || 0
            };
        });

        // Get all designers for manual assignment dropdown
        const designers = profiles.map(p => {
            const u = users.find(u => u.id === p.userId);
            return {
                id: p.userId, // Use UserID for assignment
                name: u ? `${u.firstName} ${u.lastName}` : 'Unknown Designer',
                currentLoad: p.currentLoad,
                maxCapacity: p.maxCapacity,
                status: p.status
            };
        });

        return NextResponse.json({
            orders: enrichedOrders,
            designers
        });
    } catch (error) {
        console.error('Admin assignments error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
