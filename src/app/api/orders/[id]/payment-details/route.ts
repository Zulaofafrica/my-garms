
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, findByField, DbOrder, DbDesignerProfile } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const order = await findById<DbOrder>('orders', id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!order.assignedDesignerId) {
            return NextResponse.json({ error: 'No designer assigned' }, { status: 404 });
        }

        const designerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', order.assignedDesignerId);

        if (!designerProfile) {
            return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
        }

        // Only return safe payment details
        return NextResponse.json({
            bankName: designerProfile.bankName || 'Not Set',
            accountNumber: designerProfile.accountNumber || 'Not Set',
            accountName: designerProfile.accountName || 'Not Set'
        });

    } catch (error) {
        console.error('Get payment details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
