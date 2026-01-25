
import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // In production, verify an Authorization header (CRON_SECRET) here
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        const result = await EmailService.processQueue(20); // Process up to 20 jobs
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        console.error('Queue processing failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
