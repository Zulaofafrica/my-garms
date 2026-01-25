
import { NextResponse } from 'next/server';
import { readCollection, DbOrder, logAudit } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();

        const orders = await readCollection<DbOrder>('orders');

        // Log view action? Maybe too noisy for just listing. 
        // Only log specific filtering or sensitive views?
        // Let's log it for now as "view_all_orders"
        // await logAudit(user.id, 'view_all_orders', 'Admin viewed all orders', undefined, user.email);

        return NextResponse.json({ orders });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
