
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbNotification } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const notification = await findById<DbNotification>('notifications', id);
    if (!notification) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
    if (notification.userId !== session.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await updateOne<DbNotification>('notifications', id, { read: true });

    return NextResponse.json({ success: true });
}
