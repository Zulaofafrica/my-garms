
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-session';
import { updateOne, DbCommissionPayment } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await params;

        const updated = await updateOne<DbCommissionPayment>('commission_payments', id, {
            status: 'approved',
            updatedAt: new Date().toISOString()
        });

        if (!updated) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, payment: updated });
    } catch (error) {
        console.error("Commission approval error:", error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
