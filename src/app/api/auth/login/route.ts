import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findByField, DbUser } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await findByField<DbUser>('users', 'email', email);
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is suspended or disabled
        if (user.status === 'suspended' || user.status === 'disabled') {
            return NextResponse.json(
                { error: 'Your account has been suspended. Please contact support@mygarms.com.' },
                { status: 403 }
            );
        }

        // Set session cookie
        await setSession(user.id);

        // Return user without password
        const { passwordHash, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            message: 'Logged in successfully',
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
