
import { insertOne, generateId, readCollection, query, DbNotification } from './db';

export class NotificationService {

    static async send(userId: string, type: DbNotification['type'], message: string): Promise<void> {
        const notification: DbNotification = {
            id: generateId(),
            userId,
            type,
            message,
            read: false,
            createdAt: new Date().toISOString()
        };

        await insertOne('notifications', notification); // We need to update insertOne to handle 'notifications'
    }

    static async getUnread(userId: string): Promise<DbNotification[]> {
        // We'll filter in JS for MVP if no direct query helper exists, but query is better.
        // Assuming readCollection or custom query.
        const { rows } = await query('SELECT * FROM notifications WHERE user_id = $1 AND read = FALSE ORDER BY created_at DESC', [userId]);
        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            type: row.type,
            message: row.message,
            read: row.read,
            createdAt: row.created_at.toISOString()
        }));
    }

    static async markRead(notificationId: string): Promise<void> {
        await query('UPDATE notifications SET read = TRUE WHERE id = $1', [notificationId]);
    }
}
