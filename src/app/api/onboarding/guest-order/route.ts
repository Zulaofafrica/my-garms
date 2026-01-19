import { NextRequest, NextResponse } from "next/server";
import { findByField, insertOne, DbUser, DbProfile, DbOrder, generateId } from "@/lib/db";
import { setSession } from "@/lib/session";
import path from "path";
import crypto from "crypto";

// Helper to hash password (basic for demo)
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user: userData, profile: profileData, order: orderData } = body;

        // 1. Validate Email
        const existingUser = await findByField<DbUser>('users', 'email', userData.email);
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered. Please login.' }, { status: 400 });
        }

        // 2. Create User
        const userId = generateId();
        const user: DbUser = {
            id: userId,
            email: userData.email,
            passwordHash: hashPassword(userData.password),
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'customer',
            createdAt: new Date().toISOString(),
        };
        await insertOne('users', user);

        // 3. Create Profile
        const profileId = generateId();
        const profile: DbProfile = {
            id: profileId,
            userId: userId,
            name: `${userData.firstName}'s Profile`,
            gender: profileData.gender,
            measurements: profileData.measurements,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await insertOne('profiles', profile);

        // 4. Create Order
        const orderId = generateId();
        const order: DbOrder = {
            id: orderId,
            userId: userId,
            profileId: profileId,
            templateId: orderData.templateId || 'custom',
            templateName: orderData.templateName || 'Custom Request',
            fabricId: orderData.fabricId || 'custom',
            fabricName: orderData.fabricName,
            status: 'pending',
            feedbackLog: [],
            total: 0,
            price: null,
            images: orderData.images || [],
            style: orderData.style,
            color: orderData.color,
            notes: orderData.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await insertOne('orders', order);

        // 5. Set Session (Auto-login)
        await setSession(userId);

        return NextResponse.json({
            success: true,
            message: "Account and order created!",
            user: { id: user.id, email: user.email, firstName: user.firstName },
            orderId: order.id
        });

    } catch (error) {
        console.error("Guest order error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
