import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { readCollection, DbCommissionPayment, DbUser } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const isAuthenticated = await isAdminAuthenticated();
        if (!isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const designerId = searchParams.get('designerId');

        let payments = await readCollection<DbCommissionPayment>('commission_payments');
        const users = await readCollection<DbUser>('users');

        // Join with designer details
        let enrichedPayments = payments.map(p => {
            const designer = users.find(u => u.id === p.designerId);
            return {
                ...p,
                designerName: designer ? `${designer.firstName} ${designer.lastName}` : 'Unknown Designer',
                designerEmail: designer?.email || ''
            };
        });

        // Filter
        if (status && status !== 'all') {
            enrichedPayments = enrichedPayments.filter(p => p.status === status);
        }

        if (designerId) {
            enrichedPayments = enrichedPayments.filter(p => p.designerId === designerId);
        }

        // Sort by date desc
        enrichedPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ payments: enrichedPayments });
    } catch (error) {
        console.error('Failed to get commissions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
