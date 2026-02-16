import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSystemSetting } from '@/lib/settings';

export async function GET() {
    try {
        const results = [];

        // 1. Check initial value
        const initialFee = await getSystemSetting('delivery_fee', 5000);
        results.push(`Initial delivery_fee: ${initialFee}`);

        // 2. Update to 6000 directly in DB
        await query(`INSERT INTO system_settings (key, val, updated_at) VALUES ('delivery_fee', '6000', NOW()) ON CONFLICT (key) DO UPDATE SET val = '6000', updated_at = NOW()`);

        // 3. functional check
        const newFee = await getSystemSetting('delivery_fee', 5000);
        results.push(`Updated delivery_fee: ${newFee}`);

        if (Number(newFee) === 6000) {
            results.push('SUCCESS: Setting updated and retrieved correctly.');
        } else {
            results.push('FAILURE: Retrieved value does not match 6000.');
        }

        // 4. Revert to 5000
        await query(`UPDATE system_settings SET val = '5000' WHERE key = 'delivery_fee'`);
        const revertedFee = await getSystemSetting('delivery_fee', 5000);
        results.push(`Reverted delivery_fee: ${revertedFee}`);

        return NextResponse.json({ results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
