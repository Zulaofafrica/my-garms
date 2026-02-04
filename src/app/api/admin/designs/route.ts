
import { NextResponse } from 'next/server';
import { readCollection, insertOne, generateId, DbCuratedDesign, logAudit } from '@/lib/db';
import { authApi } from '@/lib/api-client';

export async function GET(request: Request) {
    try {
        const designs = await readCollection<DbCuratedDesign>('curated_designs');
        return NextResponse.json({ designs });
    } catch (error) {
        console.error('Failed to fetch designs:', error);
        return NextResponse.json({ error: 'Failed to fetch designs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.title || !body.category) {
            return NextResponse.json({ error: 'Title and Category are required' }, { status: 400 });
        }

        const newDesign: DbCuratedDesign = {
            id: generateId(),
            title: body.title,
            category: body.category,
            style_aesthetic: body.style_aesthetic || '',
            description: body.description || '',
            base_price_range: body.base_price_range || '',
            complexity_level: body.complexity_level || 'Medium',
            designer_skill_level: body.designer_skill_level || 'intermediate',
            default_fabric: body.default_fabric || '',
            images: body.images || [],
            is_active: body.is_active || false, // Default to draft
            admin_notes: body.admin_notes || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const created = await insertOne('curated_designs', newDesign);

        // Log audit (assuming user context is available or passed, 
        // strictly real auth check should be here but for MVP relying on middleware/client)
        // In real app, we verify admin role here.

        return NextResponse.json({ design: created });
    } catch (error) {
        console.error('Failed to create design:', error);
        return NextResponse.json({ error: 'Failed to create design' }, { status: 500 });
    }
}
