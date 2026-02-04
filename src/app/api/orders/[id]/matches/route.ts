import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, DbOrder } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const order = await findById<DbOrder>('orders', id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const eligibleDesigners = await MatchingService.findEligibleDesigners(order);

        // Enrich with user details (Name) and mock missing UI fields
        // In a real app, we'd do a join or have these in designer_profile
        const { findAllByField } = await import('@/lib/db');
        const designerUserIds = eligibleDesigners.map(d => d.userId);

        // Fetch users to get names
        // Optimally: SELECT * FROM users WHERE id IN (...)
        // For MVP with our db utils: loop or fetch all (inefficient but safe for small n)
        // Let's just fetch individual user names

        const topMatches = await Promise.all(eligibleDesigners.slice(0, 5).map(async d => {
            // We need the name. Try to find the user profile or user record
            // Assuming findByField is available or we import it
            const { findByField } = await import('@/lib/db');
            const user = await findByField<any>('users', 'id', d.userId); // type as any to avoid importing DbUser if lazy
            const name = user ? `${user.firstName} ${user.lastName}` : 'Designer';

            return {
                id: d.userId,
                name: name,
                photoUrl: d.profilePhoto || null,
                specialties: d.specialties,
                rating: d.rating,
                reviewCount: d.reviewCount || 0,
                skillLevel: d.skillLevel,
                estimatedTurnaround: '5-7 days',
                minPrice: 15000, // Mock
                samples: d.portfolioSamples || []
            };
        }));

        return NextResponse.json({ matches: topMatches });

    } catch (error) {
        console.error('Get matches error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
