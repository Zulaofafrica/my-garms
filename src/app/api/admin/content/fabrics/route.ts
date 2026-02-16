import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { query, DbFabric, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rows } = await query('SELECT * FROM fabrics ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Get fabrics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Basic validation
        if (!body.name || !body.price) {
            return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
        }

        const id = generateId();
        const { rows } = await query(
            `INSERT INTO fabrics (id, name, type, price, image, color, description, in_stock, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             RETURNING *`,
            [id, body.name, body.type, body.price, body.image, body.color, body.description, body.inStock !== false]
        );

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Create fabric error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
