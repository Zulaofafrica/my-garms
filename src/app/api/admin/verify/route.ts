
import { NextResponse } from 'next/server';
import { setAdminSession } from '@/lib/admin-session';

export async function POST(request: Request) {
    try {
        const { accessCode } = await request.json();

        // Hardcoded check as requested: #12526%
        if (accessCode !== '#12526%') {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 403 });
        }

        // Set admin session cookie
        await setAdminSession();

        return NextResponse.json({ success: true, message: 'Welcome, Super Admin.' });

    } catch (error) {
        console.error("Admin verification failed:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
