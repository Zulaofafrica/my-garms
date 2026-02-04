
import { NextResponse } from 'next/server';
import { MatchingService } from '@/lib/matching-service';
import { insertOne, deleteOne, DbDesignerProfile, DbOrder, DbUser } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
    let createdIds: { context: string, id: string }[] = [];
    let debug: string[] = [];

    try {
        const testId = Date.now().toString();
        debug.push('Starting matching verification...');

        // 1. Create Users
        const designerUserId = randomUUID();
        const customerUserId = randomUUID();

        const designerUser: DbUser = {
            id: designerUserId,
            email: `d_${testId}@test.com`,
            passwordHash: 'hash',
            firstName: 'Test',
            lastName: 'Designer',
            role: 'designer',
            status: 'active',
            isVerified: true,
            createdAt: new Date().toISOString()
        };
        await insertOne('users', designerUser);
        createdIds.push({ context: 'users', id: designerUserId });
        debug.push('Designer user created');

        const customerUser: DbUser = {
            id: customerUserId,
            email: `c_${testId}@test.com`,
            passwordHash: 'hash',
            firstName: 'Test',
            lastName: 'Customer',
            role: 'customer',
            status: 'active',
            isVerified: true,
            createdAt: new Date().toISOString()
        };
        await insertOne('users', customerUser);
        createdIds.push({ context: 'users', id: customerUserId });
        debug.push('Customer user created');

        // 2. Create Test Designer Profile
        const designerProfileId = randomUUID();
        const designer: DbDesignerProfile = {
            id: designerProfileId,
            userId: designerUserId,
            specialties: ['dress', 'formal'], // Knows Dress and Formal
            skillLevel: 'basic',
            maxCapacity: 5,
            currentLoad: 0,
            rating: 5,
            status: 'available',
            reviewCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await insertOne('designer_profiles', designer);
        createdIds.push({ context: 'designer_profiles', id: designerProfileId });
        debug.push(`Designer profile created (Specialties: ${designer.specialties.join(', ')})`);

        // 3. Create Test Order (Exact Match: Dress + Formal)
        const orderMatchId = randomUUID();
        const orderMatch: DbOrder = {
            id: orderMatchId,
            userId: customerUserId,
            profileId: 'p1',
            templateId: 't1',
            templateName: 'Custom',
            fabricId: 'f1',
            fabricName: 'silk',
            category: 'dress', // Matches 'dress'
            style: 'formal',   // Matches 'formal'
            status: 'pending',
            total: 100,
            price: null,
            images: [],
            feedbackLog: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await insertOne('orders', orderMatch);
        createdIds.push({ context: 'orders', id: orderMatchId });
        debug.push(`Match Order created (Category: ${orderMatch.category})`);

        // 4. Create Test Order (No Match Category: Suit)
        const orderNoMatchId = randomUUID();
        const orderNoMatch: DbOrder = {
            ...orderMatch,
            id: orderNoMatchId,
            category: 'suit' // Designer doesn't have 'suit'
        };
        await insertOne('orders', orderNoMatch);
        createdIds.push({ context: 'orders', id: orderNoMatchId });
        debug.push(`No-Match Order created (Category: ${orderNoMatch.category})`);

        // 5. Run Matching
        debug.push('Running matching for Match Order...');
        const matches1 = await MatchingService.findEligibleDesigners(orderMatch);
        debug.push(`Matches found: ${matches1.length}`);

        debug.push('Running matching for No-Match Order...');
        const matches2 = await MatchingService.findEligibleDesigners(orderNoMatch);
        debug.push(`Matches found: ${matches2.length}`);

        const isSuccess1 = matches1.some(d => d.id === designerProfileId);
        const isSuccess2 = !matches2.some(d => d.id === designerProfileId);

        return NextResponse.json({
            success: isSuccess1 && isSuccess2,
            debug,
            results: {
                matchTest: {
                    expected: true,
                    found: isSuccess1,
                    matches: matches1.map(d => d.id)
                },
                noMatchTest: {
                    expected: false,
                    found: isSuccess2 === false,
                    designerInList: matches2.some(d => d.id === designerProfileId)
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || String(error),
            debug,
            createdIds
        }, { status: 200 });
    } finally {
        for (const item of createdIds.reverse()) {
            try {
                await deleteOne(item.context, item.id);
            } catch (e) {
                console.error(`Cleanup failed for ${item.context} ${item.id}`, e);
            }
        }
    }
}
