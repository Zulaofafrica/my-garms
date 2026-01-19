import { NextRequest, NextResponse } from "next/server";
import { findByField, insertOne, DbUser, DbProfile, DbOrder, generateId } from "@/lib/db";
import { setSession } from "@/lib/session";
import bcrypt from 'bcryptjs';

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
            passwordHash: await bcrypt.hash(userData.password, 10),
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

        // 6. Trigger Matching Service (Async - don't await blocking response?)
        // Better to await to ensure it runs, but errors shouldn't fail the request ideally.
        try {
            const { MatchingService } = await import('@/lib/matching-service');
            await MatchingService.shortlistDesigners(orderId);
        } catch (matchError) {
            console.error("Auto-matching failed:", matchError);
            // Don't fail the order creation
        }

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
