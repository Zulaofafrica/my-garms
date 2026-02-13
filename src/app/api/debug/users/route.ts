
import { NextResponse } from 'next/server';
import { findAllByField, DbUser } from '@/lib/db';

export async function GET() {
    try {
        const users = await findAllByField<DbUser>('users', 'role', 'designer');
        return NextResponse.json({
            count: users.length,
            users: users.map(u => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
