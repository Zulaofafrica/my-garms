import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Create Table
        await query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                val JSONB, -- Using JSONB for flexibility (numbers, strings, objects)
                description TEXT,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Seed Data (if not exists)
        const defaults = [
            { key: 'delivery_fee', val: 5000, description: 'Standard delivery fee in Naira' },
            { key: 'commission_rate', val: 15, description: 'Platform commission percentage (0-100)' },
            { key: 'support_phone', val: '+234 800 000 0000', description: 'Customer support phone number' },
            { key: 'support_email', val: 'support@mygarms.com', description: 'Customer support email address' }
        ];

        const results = [];
        for (const setting of defaults) {
            // Check if exists
            const { rows } = await query('SELECT key FROM system_settings WHERE key = $1', [setting.key]);
            if (rows.length === 0) {
                await query(
                    'INSERT INTO system_settings (key, val, description) VALUES ($1, $2, $3)',
                    [setting.key, JSON.stringify(setting.val), setting.description]
                );
                results.push(`Inserted ${setting.key}`);
            } else {
                results.push(`Skipped ${setting.key} (exists)`);
            }
        }

        return NextResponse.json({ message: 'System settings table setup complete', results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
