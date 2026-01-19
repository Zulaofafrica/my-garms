
// scripts/verify-assignment-flow.js
const BASE_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log("1. Creating Guest Order...");
        const unique = Date.now();
        const guestPayload = {
            user: {
                email: `customer_${unique}@test.com`,
                password: 'password123',
                firstName: 'Test',
                lastName: 'Customer'
            },
            profile: {
                gender: 'female',
                measurements: { boxy: 'true' } // simplified
            },
            order: {
                total: 50000,
                templateName: 'Test Verification Order',
                fabricName: 'Test Fabric',
                // required fields
                profileId: 'temp',
                templateId: 'temp',
                fabricId: 'temp'
            }
        };

        const orderRes = await fetch(`${BASE_URL}/onboarding/guest-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestPayload)
        });

        if (!orderRes.ok) throw new Error(`Guest order failed: ${orderRes.status} ${await orderRes.text()}`);
        const orderData = await orderRes.json();
        const orderId = orderData.orderId;
        console.log(`✅ Order Created: ${orderId}`);

        // Wait a moment for async matching (though my code awaited it, good to be safe)
        // console.log("Waiting for matching...");
        // await new Promise(r => setTimeout(r, 1000));

        // 2. Login as Designer
        console.log("\n2. Logging in as Designer...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'designer@test.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Designer login failed: ${loginRes.status}`);

        // Extract Cookie
        const cookie = loginRes.headers.get('set-cookie');
        console.log("✅ Designer Logged In");

        // 3. Check Requests
        console.log("\n3. Checking Designer Requests...");
        const requestsRes = await fetch(`${BASE_URL}/designer/requests`, {
            headers: {
                'Cookie': cookie
            }
        });

        if (!requestsRes.ok) throw new Error(`Get requests failed: ${requestsRes.status}`);
        const requestsData = await requestsRes.json();

        const foundOrder = requestsData.requests.find(r => r.id === orderId);

        if (!foundOrder) {
            console.error("❌ Order NOT found in designer requests!");
            console.log("Available requests:", requestsData.requests.map(r => r.id));
            // Debug: Check DB directly?
            return;
        }
        console.log(`✅ Order ${orderId} found in designer's shortlist.`);

        // 4. Accept Order
        console.log("\n4. Accepting Order...");
        const acceptRes = await fetch(`${BASE_URL}/designer/requests/${orderId}/accept`, {
            method: 'POST',
            headers: {
                'Cookie': cookie
            }
        });

        if (!acceptRes.ok) throw new Error(`Accept failed: ${await acceptRes.text()}`);
        console.log("✅ Order Accepted Successfully.");

        // 5. Verify Assignment (List Orders)
        const myOrdersRes = await fetch(`${BASE_URL}/designer/orders`, {
            headers: { 'Cookie': cookie }
        });
        const myOrders = (await myOrdersRes.json()).orders;
        const isAssigned = myOrders.find(r => r.id === orderId);

        if (isAssigned) {
            console.log("✅ Verified: Order is now in Designer's 'My Orders' list.");
        } else {
            console.error("❌ Order not found in My Orders list after acceptance.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

run();
