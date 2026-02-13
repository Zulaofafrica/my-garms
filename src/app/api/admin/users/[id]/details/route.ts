
import { NextResponse } from 'next/server';
import { findById, findByField, findAllByField, DbUser, DbProfile, DbDesignerProfile, DbOrder, DbCommissionPayment } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();

        const { id } = await params;
        const user = await findById<DbUser>('users', id);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        let address = user.address;
        let state = user.state;

        // If missing, look up saved addresses
        if (!address) {
            const savedAddresses = await findAllByField<any>('addresses', 'userId', id);
            if (savedAddresses.length > 0) {
                // Determine default: explicit default or first created (fallback)
                const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                address = defaultAddr.address;
                state = defaultAddr.state;
            }
        }

        const baseData = {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                createdAt: user.createdAt,
                address,
                state
            }
        };

        if (user.role === 'customer') {
            const [profiles, orders] = await Promise.all([
                findAllByField<DbProfile>('profiles', 'userId', id),
                findAllByField<DbOrder>('orders', 'userId', id)
            ]);

            const totalSpent = orders
                .filter(o => o.status !== 'cancelled')
                .reduce((sum, o) => sum + (o.price || 0), 0);

            return NextResponse.json({
                ...baseData,
                customerDetails: {
                    profiles,
                    orders,
                    totalSpent,
                    orderCount: orders.length
                }
            });

        } else if (user.role === 'designer') {
            // Fetch designer profile
            const designerProfile = await findByField<DbDesignerProfile>('designer_profiles', 'userId', id);

            // Fetch assigned orders
            // Note: Efficiently would need an index, but using DB helper fallback for now
            const assignedOrders = await findAllByField<DbOrder>('orders', 'assignedDesignerId', id);

            // Fetch commission payments
            const payments = await findAllByField<DbCommissionPayment>('commission_payments', 'designerId', id);

            // Calculate Financials
            const completedOrders = assignedOrders.filter(o => o.status === 'delivered').length;
            const activeOrders = assignedOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

            const totalCommissionEarned = payments
                .filter(p => p.status === 'approved')
                .reduce((sum, p) => sum + p.amount, 0);

            // Calculate accrued (unpaid) commission logic similar to finance route
            let accrued = 0;
            const billableStatuses = ['confirmed', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'];
            assignedOrders.forEach(o => {
                if (billableStatuses.includes(o.status) && o.price) {
                    const deliveryFee = o.priceBreakdown?.delivery || 5000;
                    const commissionable = Math.max(0, o.price - deliveryFee);
                    const rate = o.templateId ? 0.20 : 0.15;
                    accrued += (commissionable * rate);
                }
            });
            const outstandingBalance = Math.max(0, accrued - totalCommissionEarned);

            return NextResponse.json({
                ...baseData,
                designerDetails: {
                    profile: designerProfile,
                    assignedOrders,
                    payments,
                    stats: {
                        completedOrders,
                        activeOrders,
                        totalCommissionEarned,
                        outstandingBalance
                    }
                }
            });
        }

        // Default for admin or others
        return NextResponse.json(baseData);

    } catch (error) {
        console.error("Error fetching user details:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
