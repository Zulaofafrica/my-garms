
const { Pool } = require('pg');
// fetch is native in newer node or not needed for DB checks
require('dotenv').config({ path: '.env.local' });

async function verifyNotifications() {
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

    try {
        console.log("🔍 Verifying Notification System...");

        // 1. Check if we have recent email jobs
        const jobs = await pool.query(`SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5`);

        console.log(`\n📬 Recent Email Jobs: ${jobs.rows.length}`);
        jobs.rows.forEach(j => {
            console.log(`- [${j.status}] To: ${j.recipient} | Subject: ${j.subject} | Attempts: ${j.attempts}`);
        });

        // 2. Check notifications
        const notifs = await pool.query(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5`);
        console.log(`\n🔔 Recent In-App Notifications: ${notifs.rows.length}`);
        notifs.rows.forEach(n => {
            console.log(`- [${n.read ? 'READ' : 'UNREAD'}] Type: ${n.type} | Msg: ${n.message}`);
        });

        if (jobs.rows.length > 0) {
            console.log("\n✅ Emails are being queued.");
        } else {
            console.log("\n⚠️ No email jobs found. Try creating an order first.");
        }

        if (notifs.rows.length > 0) {
            console.log("✅ In-App notifications are being created.");
        } else {
            console.log("⚠️ No notifications found.");
        }

    } catch (err) {
        console.error("❌ Verification failed:", err);
    } finally {
        await pool.end();
    }
}

verifyNotifications();
