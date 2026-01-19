
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbUser, updateOne, DbOrder, DbDesignerProfile, findByField } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        if (!user || (user.role !== 'admin' && user.role !== 'designer')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { orderId, designerUserId } = await request.json();

        // Manual Assignment Logic (Override)
        // 1. Update Order
        await updateOne<DbOrder>('orders', orderId, {
            assignedDesignerId: designerUserId,
            assignmentStatus: 'assigned',
            shortlistedDesignerIds: [], // Clear shortlist
            status: 'reviewing' // OR 'confirmed'?
        });

        // 2. Update Designer Load (if valid designer)
        const designerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', designerUserId);
        if (designerProfile) {
            await updateOne<DbDesignerProfile>('designer_profiles', designerProfile.id, {
                currentLoad: designerProfile.currentLoad + 1
            });
        }

        return NextResponse.json({ success: true, message: 'Manually assigned successfully' });
    } catch (error) {
        console.error('Admin assign error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
