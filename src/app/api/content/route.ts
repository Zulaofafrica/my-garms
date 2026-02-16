import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Fetch active fabrics and all templates
        const [fabricsRes, templatesRes] = await Promise.all([
            query('SELECT * FROM fabrics WHERE in_stock = true ORDER BY name ASC'),
            query('SELECT * FROM templates ORDER BY category ASC, name ASC')
        ]);

        return NextResponse.json({
            fabrics: fabricsRes.rows,
            templates: templatesRes.rows
        });
    } catch (error) {
        console.error('Get public content error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
