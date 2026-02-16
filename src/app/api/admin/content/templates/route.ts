import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { query, DbTemplate, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { rows } = await query('SELECT * FROM templates ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Get templates error:', error);
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
        if (!body.name || !body.category) {
            return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
        }

        const id = generateId();
        const { rows } = await query(
            `INSERT INTO templates (id, name, category, image, base_price, description, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING *`,
            [id, body.name, body.category, body.image, body.basePrice || 0, body.description]
        );

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
