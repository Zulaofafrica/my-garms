import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-session';
import { query, DbSystemSetting } from '@/lib/db';

// Helper to fetch all settings as a key-value object
async function getSettingsMap() {
    const { rows } = await query('SELECT key, val FROM system_settings');
    const settings: Record<string, any> = {};
    rows.forEach((row: any) => {
        settings[row.key] = row.val;
    });
    return settings;
}

export async function GET(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await getSettingsMap();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const isAuth = await isAdminAuthenticated();
        if (!isAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const updates = Object.entries(body);

        for (const [key, value] of updates) {
            // Upsert setting
            await query(
                `INSERT INTO system_settings (key, val, updated_at)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (key) DO UPDATE SET val = $2, updated_at = NOW()`,
                [key, JSON.stringify(value)]
            );
        }

        const settings = await getSettingsMap();
        return NextResponse.json({ message: 'Settings updated', settings });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
