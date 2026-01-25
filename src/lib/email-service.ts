
import {
    DbEmailJob,
    generateId,
    insertOne,
    readCollection,
    updateOne,
    query
} from './db';

const MAX_ATTEMPTS = 3;

export class EmailService {

    /**
     * Enqueue an email to be sent asynchronously
     */
    static async enqueue(to: string, subject: string, htmlBody: string) {
        const job: DbEmailJob = {
            id: generateId(),
            recipient: to,
            subject,
            htmlBody,
            status: 'PENDING',
            attempts: 0,
            nextAttemptAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await insertOne('email_queue', job);
        return job;
    }

    /**
     * Process pending jobs from the queue
     * This should be called by a CRON job or worker endpoint
     */
    static async processQueue(limit = 10) {
        // Find PENDING jobs ready for retry/processing
        // Since readCollection fetches all, we filter in memory. 
        // For production scale, we'd add `findPendingJobs` to db.ts with SQL limit.
        const allJobs = await readCollection<DbEmailJob>('email_queue');

        const now = new Date().getTime();
        const pendingJobs = allJobs
            .filter(j => j.status === 'PENDING' || j.status === 'PROCESSING') // Naive lock check
            .filter(j => new Date(j.nextAttemptAt).getTime() <= now)
            .sort((a, b) => new Date(a.nextAttemptAt).getTime() - new Date(b.nextAttemptAt).getTime())
            .slice(0, limit);

        if (pendingJobs.length === 0) return { processed: 0, errors: 0 };

        let processed = 0;
        let errors = 0;

        for (const job of pendingJobs) {
            try {
                // Mark as processing (naive lock)
                await updateOne<DbEmailJob>('email_queue', job.id, { status: 'PROCESSING' });

                // Simulate Sending Email
                await this.sendActualEmail(job.recipient, job.subject, job.htmlBody);

                // Mark Completed
                await updateOne<DbEmailJob>('email_queue', job.id, {
                    status: 'COMPLETED',
                    processedAt: new Date().toISOString()
                });
                processed++;

            } catch (err: any) {
                console.error(`Failed to process email job ${job.id}:`, err);
                errors++;

                const attempts = job.attempts + 1;
                const failed = attempts >= MAX_ATTEMPTS;

                // Exponential backoff
                const delay = Math.pow(2, attempts) * 60 * 1000; // 2m, 4m, 8m...
                const nextAttempt = new Date(now + delay).toISOString();

                await updateOne<DbEmailJob>('email_queue', job.id, {
                    status: failed ? 'FAILED' : 'PENDING',
                    attempts,
                    error: err.message || 'Unknown error',
                    nextAttemptAt: nextAttempt
                });
            }
        }

        return { processed, errors };
    }

    /**
     * Internal stub to actually send email via SMTP/API
     */
    private static async sendActualEmail(to: string, subject: string, html: string) {
        // MOCK IMPLEMENTATION
        // In real app, use nodemailer or Resend here.
        console.log(`[EmailService] Sending to ${to} | Subject: ${subject}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Random failure injection for testing resilience
        // if (Math.random() < 0.1) throw new Error("Random SMTP Failure");

        return true;
    }
}
