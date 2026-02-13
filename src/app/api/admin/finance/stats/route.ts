import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { readCollection, DbCommissionPayment, DbOrder } from '@/lib/db';

export async function GET() {
    try {
        const isAuthenticated = await isAdminAuthenticated();
        if (!isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payments = await readCollection<DbCommissionPayment>('commission_payments');
        const orders = await readCollection<DbOrder>('orders'); // To calculate Total GMV

        const stats = {
            totalRevenue: payments
                .filter(p => p.status === 'approved')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
            pendingRevenue: payments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + (p.amount || 0), 0),
            totalGMV: orders
                .filter(o => o.paymentStatus?.includes('paid'))
                .reduce((sum, o) => sum + (o.total || 0), 0),
            pendingCount: payments.filter(p => p.status === 'pending').length,
            approvedCount: payments.filter(p => p.status === 'approved').length,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to get finance stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
