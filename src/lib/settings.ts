import { query } from '@/lib/db';

export async function getSystemSetting<T>(key: string, defaultValue: T): Promise<T> {
    try {
        const { rows } = await query('SELECT val FROM system_settings WHERE key = $1', [key]);
        if (rows.length > 0) {
            return rows[0].val as T;
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return defaultValue;
    }
}

// Cached version could be added here if performance becomes an issue
// For now, simpler is better.
