
import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'mygarms_admin_token';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super_secret_admin_key_12526'; // In prod, rely on env

export async function setAdminSession() {
    const cookieStore = await cookies();
    // Set a simple proof cookie. In a real app, this would be a signed JWT.
    // For this simple usage, we'll just set a known value.
    cookieStore.set(ADMIN_COOKIE_NAME, 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
}

export async function clearAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.has(ADMIN_COOKIE_NAME);
}

// Helper for API routes
export async function requireAdmin() {
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
        throw new Error('Unauthorized Admin Access');
    }
}
