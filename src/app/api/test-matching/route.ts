
import { NextResponse } from 'next/server';
import { insertOne, deleteOne, findById, DbUser } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
    const testId = Date.now().toString();
    const userId = randomUUID();
    let debug = [];

    try {
        debug.push(`Starting test with userId: ${userId}`);

        // 1. Create User
        const user: DbUser = {
            id: userId,
            email: `diag_${testId}@test.com`,
            passwordHash: 'hash',
            firstName: 'Diag',
            lastName: 'User',
            role: 'designer',
            createdAt: new Date().toISOString()
        };

        debug.push('Inserting user...');
        await insertOne('users', user);
        debug.push('User inserted.');

        // 2. Query User
        debug.push('Querying user...');
        const fetched = await findById<DbUser>('users', userId);
        debug.push(`User fetched: ${fetched ? 'FOUND' : 'NOT FOUND'}`);

        if (fetched) {
            debug.push(`Fetched ID: ${fetched.id}`);
        }

        // Cleanup
        debug.push('Deleting user...');
        await deleteOne('users', userId);
        debug.push('User deleted.');

        return NextResponse.json({
            success: !!fetched,
            debug
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message || String(error),
            debug
        }, { status: 200 });
    }
}
