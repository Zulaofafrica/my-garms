import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { query, generateId, DbUser } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, targetRole } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 1. Fetch Target Users
        let usersQuery = 'SELECT id FROM users';
        const params: any[] = [];

        if (targetRole === 'customer') {
            usersQuery += ' WHERE role = $1';
            params.push('customer');
        } else if (targetRole === 'designer') {
            usersQuery += ' WHERE role = $1';
            params.push('designer');
        }
        // 'all' implies no filter

        const { rows: users } = await query(usersQuery, params);

        if (users.length === 0) {
            return NextResponse.json({ message: 'No users found for this target', count: 0 });
        }

        // 2. Batch Insert Notifications
        // Construct a single INSERT statement for performance
        const values: any[] = [];
        const placeholders: string[] = [];
        let paramIndex = 1;

        const timestamp = new Date().toISOString();

        users.forEach((user: { id: string }) => {
            const id = generateId() + '_' + paramIndex; // Ensure unique ID
            placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(id, user.id, 'system', message, false, timestamp);
        });

        // Postgres has a limit on parameters (usually 65535). 
        // For very large user bases, we'd chunk this. For now, assuming < 10k users.
        const insertQuery = `
            INSERT INTO notifications (id, user_id, type, message, read, created_at)
            VALUES ${placeholders.join(', ')}
        `;

        await query(insertQuery, values);

        return NextResponse.json({ success: true, count: users.length });
    } catch (error) {
        console.error('Broadcast error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
