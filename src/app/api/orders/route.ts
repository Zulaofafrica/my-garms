import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
    findAllByField,
    insertOne,
    generateOrderId,
    DbOrder,
    logAudit,
} from '@/lib/db';

// GET /api/orders - List orders for current user
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // const session = { userId: '1768848002170_lnx5ftljb' }; // Hardcoded Kayode's ID

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        // console.log(`[API] Orders List - Page: ${page}, Limit: ${limit}`);
        const skip = (page - 1) * limit;

        const allOrders = await findAllByField<DbOrder>('orders', 'userId', session.userId);

        // Sort by createdAt descending (newest first)
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const total = allOrders.length;
        const orders = allOrders.slice(skip, skip + limit);
        const hasMore = skip + limit < total;

        return NextResponse.json({ orders, hasMore, total });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { profileId, templateId, templateName, fabricId, fabricName, total, images, category, style, color, notes, urgency, fabricSource, budgetRange, complexity } = body;

        // Validate required fields
        if (!profileId || !fabricId) {
            return NextResponse.json(
                { error: 'Missing required order details' },
                { status: 400 }
            );
        }

        const order: DbOrder = {
            id: generateOrderId(),
            userId: session.userId,
            profileId,
            templateId,
            templateName: templateName || 'Custom Design',
            fabricId,
            fabricName: fabricName || 'Selected Fabric',
            status: 'pending',
            feedbackLog: [],
            total: Number(total), // Estimated total
            price: null, // Initial price is calculating
            images: images || [],
            category,
            style,
            color,
            notes,
            // New fields
            urgency,
            fabricSource,
            budgetRange,
            complexity,
            paymentStatus: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await insertOne('orders', order);

        // Matching is now deferred to the Selection Step
        // try {
        //     const { MatchingService } = await import('@/lib/matching-service');
        //     await MatchingService.shortlistDesigners(order.id);
        // } catch (e) { console.error("Matching error:", e); }

        // Notify User (Confirmation)
        try {
            const { NotificationService } = await import('@/lib/notification-service');
            await NotificationService.notify(
                session.userId,
                'system',
                `Request received! Please proceed to select how you want your designer assigned.`,
                {
                    to: 'customer@example.com',
                    subject: 'Order Received - Action Required',
                    htmlBody: `<p>Thanks for your order #${order.id}. Please continue to select your designer.</p>`
                }
            );
        } catch (e) { console.error("Notification error:", e); }

        // Audit Log
        await logAudit(
            session.userId,
            'order.create',
            `User created order #${order.id}`,
            order.id
        );

        return NextResponse.json({
            order,
            message: 'Order created successfully. Matching with designers...'
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
