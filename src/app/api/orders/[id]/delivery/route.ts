import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { findById, updateOne, DbUser, DbOrder, logAudit } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/orders/[id]/delivery - Save Delivery Details
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { fullName, phone, address, city, state, landmark, instructions } = body;

        if (!fullName || !phone || !address || !city) {
            return NextResponse.json({ error: 'Missing required delivery fields' }, { status: 400 });
        }

        const order = await findById<DbOrder>('orders', id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.userId !== session.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check locking logic: Cannot edit if production has started
        const isProductionStarted = order.productionStage && order.productionStage !== 'design_approved';
        if (isProductionStarted) {
            return NextResponse.json({ error: 'Delivery details are locked. Production has started.' }, { status: 400 });
        }

        const updates: Partial<DbOrder> = {
            deliveryDetails: {
                fullName,
                phone,
                address,
                city,
                state: state || 'Lagos',
                country: 'Nigeria',
                landmark,
                instructions
            },
            updatedAt: new Date().toISOString()
        };

        const updatedOrder = await updateOne<DbOrder>('orders', id, updates);

        await logAudit(session.userId, 'order.delivery_update', `User updated delivery details for order #${id}`, id);

        return NextResponse.json({
            order: updatedOrder,
            message: 'Delivery details saved successfully'
        });

    } catch (error) {
        console.error('Save delivery details error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
