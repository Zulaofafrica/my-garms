
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findAllByField, DbNotification, query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch notifications for user, sorted desc
        // Note: findAllByField doesn't support generic sorting, so we sort in memory 
        // OR we can make a custom query if performance matters later.
        const notifications = await findAllByField<DbNotification>('notifications', 'userId', session.userId);

        notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
