import { NextResponse } from 'next/server';
import { findById, updateOne, logAudit, DbUser } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id } = await params;
        const body = await request.json();
        const { role } = body;

        if (!['customer', 'designer', 'admin'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updatedUser = await updateOne<DbUser>('users', id, { role });

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await logAudit(
            'admin',
            'update_role',
            `Super Admin updated user ${id} role to ${role}`,
            id
        );

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt
            },
            message: 'User role updated'
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
