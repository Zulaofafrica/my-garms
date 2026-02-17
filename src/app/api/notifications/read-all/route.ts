
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findAllByField, updateOne, DbNotification } from '@/lib/db';

export async function POST() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await findAllByField<DbNotification>('notifications', 'userId', session.userId);
        const unread = notifications.filter(n => !n.read);

        const updates = unread.map(n =>
            updateOne<DbNotification>('notifications', n.id, { read: true })
        );

        await Promise.all(updates);

        return NextResponse.json({ success: true, count: unread.length });
    } catch (error) {
        console.error('Mark all read error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
