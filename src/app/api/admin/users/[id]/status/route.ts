
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
        const { status, isVerified } = body; // Expect partial updates

        const existingUser = await findById<DbUser>('users', id);
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updates: Partial<DbUser> = {};
        let auditAction = '';
        let auditDetails = '';

        if (status && ['active', 'suspended', 'disabled'].includes(status)) {
            updates.status = status;
            auditAction = 'update_status';
            auditDetails = `Updated user status to ${status}`;
        }

        if (typeof isVerified === 'boolean') {
            updates.isVerified = isVerified;
            auditAction = auditAction || 'update_verification'; // Prioritize status change label if both change
            auditDetails = auditDetails ? `${auditDetails}, verification=${isVerified}` : `Updated verification to ${isVerified}`;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        await updateOne<DbUser>('users', id, updates);

        await logAudit(
            'admin',
            auditAction,
            `Super Admin: ${auditDetails} for user ${id}`,
            id
        );

        return NextResponse.json({ success: true, user: { ...existingUser, ...updates } });

    } catch (error) {
        console.error("Update user status failed:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
