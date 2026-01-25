import { NextResponse } from 'next/server';
import { readCollection, DbAuditLog } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();

        const logs = await readCollection<DbAuditLog>('audit_logs');

        return NextResponse.json({ logs });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
