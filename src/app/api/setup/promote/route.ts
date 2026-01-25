
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    // SECURITY WARNING: This route is for development/setup only.
    // It allows anyone to become an admin.
    // Delete this file after use.

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    try {
        const result = await query(
            "UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role",
            [email]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `User ${email} is now an Admin!`,
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Promotion failed:", error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
