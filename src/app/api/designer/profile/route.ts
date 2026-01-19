
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, findByField, updateOne, insertOne, DbUser, DbDesignerProfile, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let profile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', user.id);

        // Return default empty profile if none exists (rare, should be created on signup ideally)
        if (!profile) {
            return NextResponse.json({
                profile: {
                    specialties: [],
                    skillLevel: 'basic',
                    maxCapacity: 5,
                    currentLoad: 0,
                    status: 'available',
                    rating: 0
                }
            });
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error('Get designer profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await findById<DbUser>('users', session.userId);
        if (!user || user.role !== 'designer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { specialties, maxCapacity, status } = body;

        let profile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', user.id);

        if (!profile) {
            // Create if missing
            profile = {
                id: 'dp_' + user.id,
                userId: user.id,
                specialties: specialties || [],
                skillLevel: 'basic',
                maxCapacity: maxCapacity || 5,
                currentLoad: 0,
                rating: 0,
                status: status || 'available',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            await insertOne('designer_profiles', profile);
        } else {
            // Update existing
            await updateOne<DbDesignerProfile>('designer_profiles', profile.id, {
                specialties: specialties !== undefined ? specialties : profile.specialties,
                maxCapacity: maxCapacity !== undefined ? maxCapacity : profile.maxCapacity,
                status: status !== undefined ? status : profile.status
            });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error('Update designer profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
