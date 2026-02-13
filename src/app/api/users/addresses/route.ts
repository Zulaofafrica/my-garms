import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findAllByField, insertOne, generateId, DbAddress } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const addresses = await findAllByField<DbAddress>('addresses', 'userId', session.userId);
        return NextResponse.json({ addresses });

    } catch (error) {
        console.error('List addresses error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { label, fullName, phone, address, city, state, isDefault } = body;

        if (!label || !fullName || !phone || !address || !city || !state) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newAddress: DbAddress = {
            id: generateId(),
            userId: session.userId,
            label,
            fullName,
            phone,
            address,
            city,
            state,
            isDefault: isDefault || false,
            createdAt: new Date().toISOString()
        };

        const savedAddress = await insertOne('addresses', newAddress);
        return NextResponse.json({ address: savedAddress });

    } catch (error) {
        console.error('Create address error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
