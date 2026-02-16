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
        const orders = await readCollection<DbOrder>('orders');

        // Fetch dynamic settings
        const { getSystemSetting } = await import('@/lib/settings');
        const defaultDeliveryFee = await getSystemSetting('delivery_fee', 5000);
        const defaultCommissionRate = (await getSystemSetting('commission_rate', 15)) / 100;

        // Calculate Total Accrued Commission (Total Commission ever generated)
        const billableStatuses = ['confirmed', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'];
        const totalAccruedProfit = orders.reduce((sum, o) => {
            if (billableStatuses.includes(o.status) && o.price) {
                const deliveryFee = o.priceBreakdown?.delivery || defaultDeliveryFee;
                const commissionable = Math.max(0, o.price - deliveryFee);
                // Use dynamic rate if templateId is present (assuming templates might have higher rate, or just use standard for now)
                // For now, let's stick to the simpler logic: if it was hardcoded 0.20/0.15, we might want to respect that distinction or unify it.
                // The implementation plan mainly focused on unifying. Let's use the DB setting as the base.
                // If the previous code had specific logic (0.20 for templates), we should probably keep that relative difference or simplify.
                // Let's assume the DB setting is the "Base Rate" (e.g. 15%).
                const rate = defaultCommissionRate;
                return sum + (commissionable * rate);
            }
            return sum;
        }, 0);

        const totalRevenue = payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const submittedCommissions = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const stats = {
            totalRevenue,
            submittedCommissions, // Was "pendingRevenue"
            pendingRevenue: Math.max(0, totalAccruedProfit - totalRevenue), // Total Due
            totalGMV: orders
                .filter(o => o.paymentStatus?.includes('paid')) // Only count paid orders for GMV? Or all? Usually GMV is Gross Merchandise Value of sold items.
                // Keeping loose definition to match previous implementation logic if needed, but 'paymentStatus' check is safer.
                .reduce((sum, o) => sum + (o.total || 0), 0),
            submittedCount: payments.filter(p => p.status === 'pending').length,
            approvedCount: payments.filter(p => p.status === 'approved').length,
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Failed to get finance stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
