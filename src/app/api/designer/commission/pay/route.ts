
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, insertOne, generateId, DbUser, DbCommissionPayment } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { amount, proofUrl, notes } = body; // Note: orderIds are no longer needed for direct linking

        if (!amount || amount <= 0 || !proofUrl) {
            return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
        }

        const payment: DbCommissionPayment = {
            id: 'cp_' + generateId(),
            designerId: user.id,
            amount: Number(amount),
            proofUrl,
            status: 'pending',
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await insertOne('commission_payments', payment);

        return NextResponse.json({ success: true, message: 'Payment submitted for review', payment });
    } catch (error) {
        console.error('Commission payment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
