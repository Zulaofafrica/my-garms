
import { NextResponse } from 'next/server';
import { readCollection, DbCuratedDesign } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const allDesigns = await readCollection<DbCuratedDesign>('curated_designs');
        // Filter only active designs for public view
        const activeDesigns = allDesigns.filter(d => d.is_active);
        return NextResponse.json({ designs: activeDesigns });
    } catch (error) {
        console.error('Failed to fetch curated designs:', error);
        return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
    }
}
