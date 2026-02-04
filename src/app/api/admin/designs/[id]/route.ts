
import { NextResponse } from 'next/server';
import { findById, updateOne, deleteOne, DbCuratedDesign } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params is a promise in Next 15+
) {
    try {
        const { id } = await params;
        const design = await findById<DbCuratedDesign>('curated_designs', id);
        if (!design) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }
        return NextResponse.json({ design });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch design' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updated = await updateOne<DbCuratedDesign>('curated_designs', id, {
            ...body,
            updated_at: new Date().toISOString()
        });

        if (!updated) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }

        return NextResponse.json({ design: updated });
    } catch (error) {
        console.error('Update failed:', error);
        return NextResponse.json({ error: 'Failed to update design' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteOne('curated_designs', id);
        if (!success) {
            return NextResponse.json({ error: 'Design not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete design' }, { status: 500 });
    }
}
