
import { NextResponse } from 'next/server';
import { findAllByField, findById, DbUser, DbOrder, DbCommissionPayment } from '@/lib/db';

export async function GET() {
    try {
        // Specific ID for Abu Abel from previous list
        const designer = await findById<DbUser>('users', '1769277963739_jc8fahp7d');

        if (!designer) {
            return NextResponse.json({ error: 'Designer not found' });
        }

        const orders = await findAllByField<DbOrder>('orders', 'assignedDesignerId', designer.id);
        const payments = await findAllByField<DbCommissionPayment>('commission_payments', 'designerId', designer.id);

        const billableStatuses = ['confirmed', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'];

        let totalAccrued = 0;
        const breakdown = orders.map(o => {
            const isBillable = billableStatuses.includes(o.status);
            const price = o.price || 0;
            const deliveryFee = o.priceBreakdown?.delivery || 5000;
            const commissionable = Math.max(0, price - deliveryFee);
            const rate = o.templateId ? 0.20 : 0.15;
            const commission = isBillable ? (commissionable * rate) : 0;

            if (isBillable && price > 0) {
                totalAccrued += commission;
            }

            return {
                orderId: o.id,
                templateName: o.templateName,
                status: o.status,
                isBillable,
                price,
                deliveryFee,
                commissionable,
                hasTemplateId: !!o.templateId,
                rate,
                commission,
            };
        });

        const totalPaid = payments
            .filter(p => p.status === 'approved')
            .reduce((sum, p) => sum + p.amount, 0);

        return NextResponse.json({
            designer: { id: designer.id, name: `${designer.firstName} ${designer.lastName}` },
            breakdown,
            summary: {
                totalAccrued,
                totalPaid,
                balance: Math.max(0, totalAccrued - totalPaid)
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
