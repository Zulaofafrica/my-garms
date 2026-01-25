import { NextResponse } from 'next/server';
import { readCollection, findById, updateOne, logAudit, DbUser } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();

        const users = await readCollection<DbUser>('users');
        // Filter sensitive data
        const safeUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            status: u.status,
            isVerified: u.isVerified,
            createdAt: u.createdAt
        }));

        await logAudit('admin', 'view_users', 'Super Admin viewed user list');

        return NextResponse.json({ users: safeUsers });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
