
import { NextRequest, NextResponse } from 'next/server';
import { findById } from '@/lib/db';
import { MatchingService } from '@/lib/matching-service';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const debugOrderId = url.searchParams.get('orderId');

        if (debugOrderId) {
            const logs: string[] = [];
            // Hijack console.log to capture service logs
            const originalLog = console.log;
            const originalWarn = console.warn;
            console.log = (msg: any) => logs.push(`LOG: ${msg}`);
            console.warn = (msg: any) => logs.push(`WARN: ${msg}`);

            try {
                const order = await findById('orders', debugOrderId);
                if (!order) return NextResponse.json({ error: 'Order not found' });

                logs.push(`Debug Match for Order ${order.id} (fresh diag2)`);

                // Call the service directly
                // @ts-ignore
                const eligible = await MatchingService.findEligibleDesigners(order);

                return NextResponse.json({ logs, eligible });
            } catch (err: any) {
                logs.push(`ERROR: ${err.message}`);
                return NextResponse.json({ logs, error: err.message });
            } finally {
                console.log = originalLog;
                console.warn = originalWarn;
            }
        }

        return NextResponse.json({ message: "Use ?orderId=..." });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
