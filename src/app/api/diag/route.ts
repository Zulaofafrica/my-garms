
import { NextRequest, NextResponse } from 'next/server';
import { readCollection, updateOne, DbOrder } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';
import { findById } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const debugOrderId = url.searchParams.get('debugMatchOrderId');

        if (debugOrderId) {
            const logs: string[] = [];
            // Hijack console.log to capture service logs
            const originalLog = console.log;
            const originalWarn = console.warn;
            console.log = (msg: any) => logs.push(`LOG: ${msg}`);
            console.warn = (msg: any) => logs.push(`WARN: ${msg}`);

            try {
                const order = await findById<DbOrder>('orders', debugOrderId);
                if (!order) return NextResponse.json({ error: 'Order not found' });

                logs.push(`Debug Match for Order ${order.id} at ${new Date().toISOString()}`);

                const eligible = await MatchingService.findEligibleDesigners(order);

                return NextResponse.json({ logs, eligible });
            } finally {
                console.log = originalLog;
                console.warn = originalWarn;
            }
        }

        const orders = await readCollection('orders');
        const designers = await readCollection('designer_profiles');

        const recentOrders = orders
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((o: any) => ({
                id: o.id,
                templateName: o.templateName,
                category: o.category,
                style: o.style,
                status: o.status,
                priority: o.urgency,
                assignmentStatus: o.assignmentStatus,
                shortlisted: o.shortlistedDesignerIds
            }));

        const designerList = designers.map((d: any) => ({
            id: d.id,
            userId: d.userId,
            name: d.name, // Note: name is on user/profile, not designer profile usually, but verifying structure
            specialties: d.specialties,
            status: d.status,
            load: `${d.currentLoad}/${d.maxCapacity}`,
            rating: d.rating,
            skillLevel: d.skillLevel
        }));

        return NextResponse.json({ recentOrders, designerList });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { orderId, assignmentStatus } = await req.json();
        await updateOne<DbOrder>('orders', orderId, {
            assignmentStatus
        });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
