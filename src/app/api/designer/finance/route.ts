
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSession } from '@/lib/session';
import { findById, findAllByField, DbUser, DbOrder, DbCommissionPayment } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Calculate Accrued Commission
        // Get all orders assigned to this designer that are in a 'billable' state
        const allOrders = await findAllByField<DbOrder>('orders', 'userId', 'IGNORED_BUT_NEED_ALL');
        // Note: findAllByField for 'orders' usually targets user_id. We need a way to find by assignedDesignerId.
        // Currently db.ts doesn't support 'assignedDesignerId' directly in findAllByField efficiently without updates.
        // For now, let's fetch all orders and filter (inefficient but works for prototype) OR add a better query.

        // Let's improve this by fetching all orders and filtering in memory since we don't have a direct query tool exposed yet for this specific field
        // Actually, we can just read the whole collection if it's small, but that's bad practice.
        // Better: Update db.ts to support finding by any field? Or just use the existing one but we need to check if 'orders' logic in findAllByField supports generic fields.
        // Looking at db.ts:
        /*
        if (collection === 'orders' && field === 'userId') { ... }
        ...
        const all = await readCollection<T>(collection);
        return all.filter((item) => item[field] === value);
        */
        // It falls back to readCollection and filter if not specialized. So we can use findAllByField('orders', 'assignedDesignerId', user.id).

        const designerOrders = await findAllByField<DbOrder>('orders', 'assignedDesignerId', user.id);

        let accrued = 0;
        const billableStatuses = ['confirmed', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'];

        designerOrders.forEach(o => {
            if (billableStatuses.includes(o.status) && o.price) {
                // 15% standard, 20% for curated designs (templateId present)
                const deliveryFee = o.priceBreakdown?.delivery || 5000;
                const commissionable = Math.max(0, o.price - deliveryFee);
                const rate = o.templateId ? 0.20 : 0.15;
                accrued += (commissionable * rate);
            }
        });

        // 2. Calculate Paid Commission
        const payments = await findAllByField<DbCommissionPayment>('commission_payments', 'designerId', user.id);

        const paid = payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + p.amount, 0);

        const pending = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const balance = Math.max(0, accrued - paid);

        return NextResponse.json({
            accrued,
            paid,
            pending,
            balance
        });

    } catch (error) {
        console.error('Finance stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
