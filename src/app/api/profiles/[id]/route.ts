import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, deleteOne, DbProfile, logAudit } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PUT /api/profiles/[id] - Update profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Find profile
        const profile = await findById<DbProfile>('profiles', id);
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Check ownership
        if (profile.userId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update profile
        const updates: Partial<DbProfile> = {
            ...body,
            updatedAt: new Date().toISOString(),
        };

        // Don't allow changing userId
        delete updates.userId;
        delete updates.id;

        const updatedProfile = await updateOne<DbProfile>('profiles', id, updates);

        if (updatedProfile) {
            await logAudit(session.userId, 'profile.update', `User updated profile ${updatedProfile.name}`, id);
        }

        return NextResponse.json({
            profile: updatedProfile,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/profiles/[id] - Delete profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Find profile
        const profile = await findById<DbProfile>('profiles', id);
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Check ownership
        if (profile.userId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await deleteOne<DbProfile>('profiles', id);

        await logAudit(session.userId, 'profile.delete', `User deleted profile ${profile.name}`, id);

        return NextResponse.json({
            message: 'Profile deleted successfully',
        });
    } catch (error) {
        console.error('Delete profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
