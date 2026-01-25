
import { NextResponse } from 'next/server';
import { updateOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { accessCode } = await request.json();

        if (accessCode !== '#12526%') {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
        }

        // Promote user to admin
        await updateOne('users', user.id, { role: 'admin' });

        return NextResponse.json({ success: true, message: 'Access granted. Welcome, Admin.' });

    } catch (error) {
        console.error("Access verification failed:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
