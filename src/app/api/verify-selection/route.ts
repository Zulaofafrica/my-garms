import { NextRequest, NextResponse } from 'next/server';
import { generateId, insertOne, updateOne, findById, DbOrder } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';

export async function GET() {
    try {
        // 1. Create a Dummy User and Order
        const userId = 'verify_user_' + generateId();
        const orderId = 'verify_order_' + generateId();

        await insertOne('users', {
            id: userId,
            email: `verify_${generateId()}@test.com`,
            role: 'customer',
            firstName: 'Test',
            lastName: 'User',
            status: 'active',
            isVerified: true,
            createdAt: new Date().toISOString()
        } as any);

        const order: DbOrder = {
            id: orderId,
            userId: userId,
            profileId: 'p1',
            templateId: 't1',
            templateName: 'Test Request',
            fabricId: 'f1',
            fabricName: 'Fabric',
            status: 'pending',
            feedbackLog: [],
            total: 50000,
            price: null,
            images: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await insertOne('orders', order);

        // 2. Test Get Matches
        const matches = await MatchingService.findEligibleDesigners(order);
        const matchCount = matches.length;

        // 3. Test Auto Assign
        const autoRes = await MatchingService.shortlistDesigners(orderId);

        // Reset for Manual
        await updateOne('orders', orderId, { assignmentStatus: 'open', shortlistedDesignerIds: [] });

        // 4. Test Manual Assign (Pick first match if exists)
        let manualRes = false;
        if (matchCount > 0) {
            const designerId = matches[0].userId;
            await updateOne('orders', orderId, {
                assignmentStatus: 'shortlisted',
                shortlistedDesignerIds: [designerId]
            });
            manualRes = true;
        }

        return NextResponse.json({
            success: true,
            orderId,
            matchCount,
            autoRes,
            manualRes
        });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
