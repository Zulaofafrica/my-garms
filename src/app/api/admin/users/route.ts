import { NextResponse } from 'next/server';
import { readCollection, findById, updateOne, logAudit, DbUser } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await requireAdmin();

        const [users, addresses] = await Promise.all([
            readCollection<DbUser>('users'),
            readCollection<any>('addresses')
        ]);

        // Filter sensitive data and populate address from saved addresses if missing
        const safeUsers = users.map(u => {
            let address = u.address;
            let state = u.state;

            // If no address on user record, try to find a saved address
            if (!address) {
                const userAddresses = addresses.filter((a: any) => a.userId === u.id);
                const defaultAddress = userAddresses.find((a: any) => a.isDefault) || userAddresses[0];

                if (defaultAddress) {
                    address = defaultAddress.address;
                    state = defaultAddress.state;
                }
            }

            return {
                id: u.id,
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                role: u.role,
                status: u.status,
                isVerified: u.isVerified,
                createdAt: u.createdAt,
                address,
                state
            };
        });

        await logAudit('admin', 'view_users', 'Super Admin viewed user list');

        return NextResponse.json({ users: safeUsers });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
