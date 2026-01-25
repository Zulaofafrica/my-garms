
import { NextResponse } from 'next/server';
import { findById, findByField, findAllByField, DbUser, DbProfile, DbOrder, DbDesignerProfile, DbAuditLog } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';
import { MatchingService } from '@/lib/matching-service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id } = await params;
        const order = await findById<DbOrder>('orders', id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Fetch Customer
        const customer = await findById<DbUser>('users', order.userId);

        // Fetch Profile used
        const profile = await findById<DbProfile>('profiles', order.profileId);

        // Fetch Assigned Designer (if any)
        let assignedDesigner: DbUser | null = null;
        let assignedDesignerProfile: DbDesignerProfile | null = null;

        if (order.assignedDesignerId) {
            assignedDesigner = await findById<DbUser>('users', order.assignedDesignerId);
            assignedDesignerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', order.assignedDesignerId);
        }

        // Fetch Recommended Designers (Matching Logic)
        const recommendedDesigners = await MatchingService.findEligibleDesigners(order);

        // Fetch All Active Designers for manual assignment dropdown
        const allDesignersRaw = await findAllByField<DbUser>('users', 'role', 'designer');
        const allDesigners = allDesignersRaw.map(u => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName
        }));

        // Enrich recommendations with User details (Names)
        const enrichedRecommendations = await Promise.all(recommendedDesigners.map(async (dp) => {
            const user = await findById<DbUser>('users', dp.userId);
            return {
                ...dp,
                firstName: user?.firstName || 'Unknown',
                lastName: user?.lastName || 'Designer'
            };
        }));

        // Fetch Audit Logs / History for this order
        const logs = await findAllByField<DbAuditLog>('audit_logs', 'resourceId', id);

        return NextResponse.json({
            order,
            customer: customer ? {
                id: customer.id,
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
            } : null,
            profile,
            assignedDesigner: assignedDesigner ? {
                user: {
                    id: assignedDesigner.id,
                    firstName: assignedDesigner.firstName,
                    lastName: assignedDesigner.lastName,
                    email: assignedDesigner.email
                },
                profile: assignedDesignerProfile
            } : null,
            recommendedDesigners: enrichedRecommendations,
            allDesigners,
            logs
        });

    } catch (error) {
        console.error("Error fetching order details:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
