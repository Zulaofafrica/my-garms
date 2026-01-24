
import { NextResponse } from 'next/server';
import { MatchingService } from '@/lib/matching-service';
import { insertOne, deleteOne, findById, DbDesignerProfile, DbOrder, DbUser } from '@/lib/db';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
    let createdIds: { context: string, id: string }[] = [];
    let debug: string[] = [];

    try {
        const testId = Date.now().toString();
        debug.push('Starting FULL FLOW verification...');

        // 1. Create Users
        const designerUserId = randomUUID();
        const customerUserId = randomUUID();

        // Create Designer User
        const designerUser: DbUser = {
            id: designerUserId,
            email: `d_${testId}@test.com`,
            passwordHash: 'hash',
            firstName: 'Test',
            lastName: 'Designer',
            role: 'designer',
            createdAt: new Date().toISOString()
        };
        await insertOne('users', designerUser);
        createdIds.push({ context: 'users', id: designerUserId });

        // Create Customer User
        const customerUser: DbUser = {
            id: customerUserId,
            email: `c_${testId}@test.com`,
            passwordHash: 'hash',
            firstName: 'Test',
            lastName: 'Customer',
            role: 'customer',
            createdAt: new Date().toISOString()
        };
        await insertOne('users', customerUser);
        createdIds.push({ context: 'users', id: customerUserId });

        debug.push('Users created');

        // 2. Create Designer Profile (Specializing in "Native Wear")
        const designerProfileId = randomUUID();
        const designer: DbDesignerProfile = {
            id: designerProfileId,
            userId: designerUserId,
            specialties: ['native'], // Only knows Native
            skillLevel: 'basic',
            maxCapacity: 5,
            currentLoad: 0,
            rating: 5,
            status: 'available',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await insertOne('designer_profiles', designer);
        createdIds.push({ context: 'designer_profiles', id: designerProfileId });
        debug.push('Designer profile created [Specialty: Native]');

        // 3. Simulate Order Creation (Directly calling same logic as POST /api/orders would, but manually to verify data save)
        // Ideally we'd call the API endpoint, but we can't fetch internally easily.
        // Instead, we will perform the exact steps: Insert Order -> Call Shortlist.

        const orderId = randomUUID();
        const order: DbOrder = {
            id: orderId,
            userId: customerUserId,
            profileId: 'p1',
            templateId: 't1',
            templateName: 'Native Design',
            fabricId: 'f1',
            fabricName: 'silk',
            category: 'native', // Matches!
            style: 'traditional',
            status: 'pending',
            total: 500,
            price: null,
            images: [],
            feedbackLog: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await insertOne('orders', order);
        createdIds.push({ context: 'orders', id: orderId });
        debug.push('Order inserted [Category: Native]');

        // 4. Trigger Shortlist (The manual step that happens in API)
        debug.push('Triggering MatchingService.shortlistDesigners...');
        const success = await MatchingService.shortlistDesigners(orderId);
        debug.push(`Shortlist executed. Result: ${success}`);

        // 5. Verify Result
        const updatedOrder = await findById<DbOrder>('orders', orderId);

        const isShortlisted = updatedOrder?.assignmentStatus === 'shortlisted';
        const hasDesigner = updatedOrder?.shortlistedDesignerIds?.includes(designerUserId); // DbOrder stores USER IDs in shortlist

        return NextResponse.json({
            success: isShortlisted && hasDesigner,
            debug,
            results: {
                orderStatus: updatedOrder?.assignmentStatus,
                shortlistedCount: updatedOrder?.shortlistedDesignerIds?.length,
                designerFound: hasDesigner
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
            } catch (e) { console.error(e); }
        }
    }
}
