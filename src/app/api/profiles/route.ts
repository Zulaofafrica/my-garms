import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
    findAllByField,
    insertOne,
    generateId,
    DbProfile,
} from '@/lib/db';

// GET /api/profiles - List profiles for current user
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profiles = await findAllByField<DbProfile>('profiles', 'userId', session.userId);

        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Get profiles error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/profiles - Create new profile
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, gender, measurements } = body;

        // Validate required fields
        if (!name || !gender) {
            return NextResponse.json(
                { error: 'Name and gender are required' },
                { status: 400 }
            );
        }

        if (!['male', 'female'].includes(gender)) {
            return NextResponse.json(
                { error: 'Gender must be "male" or "female"' },
                { status: 400 }
            );
        }

        const newProfile: DbProfile = {
            id: generateId(),
            userId: session.userId,
            name,
            gender,
            measurements: measurements || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await insertOne('profiles', newProfile);

        return NextResponse.json({
            profile: newProfile,
            message: 'Profile created successfully',
        });
    } catch (error) {
        console.error('Create profile error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
