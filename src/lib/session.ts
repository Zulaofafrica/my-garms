import { cookies } from 'next/headers';
import { findById, DbUser } from './db';

const SESSION_COOKIE_NAME = 'mygarms_session';

export interface Session {
    userId: string;
    role: 'customer' | 'designer' | 'admin';
}

// Get current session from cookies
export async function getSession(): Promise<Session | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) return null;

    try {
        const session: Session = JSON.parse(
            Buffer.from(sessionCookie.value, 'base64').toString()
        );
        return session;
    } catch {
        return null;
    }
}

// Set session cookie
export async function setSession(userId: string, role: 'customer' | 'designer' | 'admin'): Promise<void> {
    const cookieStore = await cookies();
    const session: Session = { userId, role };
    const value = Buffer.from(JSON.stringify(session)).toString('base64');

    cookieStore.set(SESSION_COOKIE_NAME, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

// Clear session cookie
export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

// Get current authenticated user
export async function getCurrentUser(): Promise<Omit<DbUser, 'passwordHash'> | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await findById<DbUser>('users', session.userId);
    if (!user) return null;

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

// Check if user is authenticated (for API routes)
export async function requireAuth(): Promise<{ userId: string } | Response> {
    const session = await getSession();

    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    return { userId: session.userId };
}
