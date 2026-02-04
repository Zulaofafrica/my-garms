import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findByField, insertOne, generateId, DbUser } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName } = body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!email.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await findByField<DbUser>('users', 'email', email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const newUser: DbUser = {
            id: generateId(),
            email,
            passwordHash,
            firstName,
            lastName,
            role: body.role === 'designer' ? 'designer' : 'customer',
            status: 'active',
            isVerified: false,
            createdAt: new Date().toISOString(),
        };

        await insertOne('users', newUser);

        // Set session cookie
        await setSession(newUser.id, newUser.role);

        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            user: userWithoutPassword,
            message: 'Account created successfully',
        });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
