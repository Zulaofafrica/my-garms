
import { DbNotification, generateId, insertOne } from './db';
import { EmailService } from './email-service';

export class NotificationService {

    /**
     * Create an in-app notification and optionally send an email
     */
    static async notify(
        userId: string,
        type: 'system' | 'order_update' | 'request_received',
        message: string,
        emailOptions?: { to: string, subject: string, htmlBody: string }
    ) {
        // 1. Create In-App Notification
        const notification: DbNotification = {
            id: generateId(),
            userId,
            type,
            message,
            read: false,
            createdAt: new Date().toISOString()
        };

        try {
            await insertOne('notifications', notification);
        } catch (e) {
            console.error('Failed to create in-app notification:', e);
        }

        // 2. Enqueue Email if requested
        if (emailOptions) {
            try {
                await EmailService.enqueue(emailOptions.to, emailOptions.subject, emailOptions.htmlBody);
            } catch (e) {
                console.error('Failed to enqueue email:', e);
            }
        }
    }
}
