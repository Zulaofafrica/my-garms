
import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Needed for some Vercel/Neon connections
            }
        });
    }
    return pool;
}

export async function query(text: string, params?: any[]) {
    const p = getPool();
    return p.query(text, params);
}

// Database model types
export interface DbUser {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'designer' | 'admin';
    status: 'active' | 'suspended' | 'disabled';
    isVerified: boolean;
    createdAt: string;
}

export interface DbProfile {
    id: string;
    userId: string;
    name: string;
    gender: 'male' | 'female';
    measurements: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface FeedbackEntry {
    id: string;
    userId: string;
    userName: string;
    action: 'approve' | 'suggest_edit' | 'request_change' | 'set_price' | 'reply';
    comment: string;
    attachmentUrl?: string;
    timestamp: string;
}

export interface DbDesignerProfile {
    id: string;
    userId: string;
    specialties: string[];
    skillLevel: 'basic' | 'advanced' | 'premium';
    maxCapacity: number;
    currentLoad: number;
    rating: number; // 0-5
    status: 'available' | 'busy' | 'offline';
    createdAt: string;
    updatedAt: string;
    // Personal Details
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    workshopAddress?: string;
    phoneNumber?: string;
    identificationUrl?: string;
}

export interface DbAuditLog {
    id: string;
    userId: string; // Actor
    userEmail?: string;
    action: string;
    resourceId?: string;
    details: string; // JSON string or description
    timestamp: string;
}

export interface DbOrder {
    id: string;
    userId: string;
    profileId: string;
    templateId: string;
    templateName: string;
    fabricId: string;
    fabricName: string;
    status: 'pending' | 'reviewing' | 'changes_requested' | 'confirmed' | 'sewing' | 'shipping' | 'delivered' | 'cancelled';
    assignedDesignerId?: string;

    // Assignment fields
    assignmentStatus?: 'open' | 'shortlisted' | 'assigned' | 'completed';
    shortlistedDesignerIds?: string[];
    assignmentExpiresAt?: string;

    // Dispute Management
    disputeStatus?: 'none' | 'opened' | 'resolved';
    disputeReason?: string;
    disputeResolution?: string;

    feedbackLog: FeedbackEntry[];
    total: number;
    price: number | null;
    images: string[];
    style?: string;
    // New Matching Fields
    category?: 'dress' | 'suit' | 'shirt' | 'native' | 'jacket' | 'two-piece' | 'other';
    complexity?: 'simple' | 'moderate' | 'detailed';
    urgency?: 'flexible' | 'standard' | 'urgent';
    budgetRange?: 'budget' | 'standard' | 'premium';
    fabricSource?: 'platform' | 'own' | 'unsure';

    // Pricing Breakdown
    priceBreakdown?: {
        fabric: number;
        labor: number;
        customization: number;
        delivery: number; // Fixed at 5000
    };

    // Delivery Details
    deliveryDetails?: {
        fullName: string;
        phone: string;
        address: string;
        city: string;
        state?: string; // Optional, might be useful for Nigeria
        country: 'Nigeria'; // Fixed
        landmark?: string;
        instructions?: string;
    };

    color?: string;
    notes?: string;
    paymentStatus?: 'pending' | 'verify_70' | 'paid_70' | 'verify_100' | 'paid_100';
    paymentType?: 'full' | 'partial';
    proofUrl?: string;
    productionStage?: 'design_approved' | 'sewing' | 'finishing' | 'ready_for_delivery' | 'in_transit' | 'delivered';
    estimatedCompletionDate?: string;
    productionStartDate?: string;
    productionEndDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DbNotification {
    id: string;
    userId: string;
    type: 'system' | 'order_update' | 'request_received';
    message: string;
    read: boolean;
    createdAt: string;
}

export interface DbCommissionPayment {
    id: string;
    designerId: string;
    amount: number;
    proofUrl: string;
    status: 'pending' | 'approved' | 'declined';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DbDispute {
    id: string;
    orderId: string;
    creatorId: string;
    category: string;
    description: string;
    status: 'OPEN' | 'RESPONSE_REQUIRED' | 'RESOLVED' | 'CLOSED';
    resolution?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DbDisputeEvidence {
    id: string;
    disputeId: string;
    uploaderId: string;
    fileUrl: string;
    fileType: string;
    description: string;
    createdAt: string;
}

export interface DbEmailJob {
    id: string;
    recipient: string;
    subject: string;
    htmlBody: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    attempts: number;
    nextAttemptAt: string;
    error?: string;
    createdAt: string;
    processedAt?: string;
}

function mapUser(row: any): DbUser {
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        status: row.status || 'active',
        isVerified: row.is_verified || false,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    };
}

function mapProfile(row: any): DbProfile {
    return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        gender: row.gender,
        measurements: row.measurements || {},
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
}

function mapDesignerProfile(row: any): DbDesignerProfile {
    return {
        id: row.id,
        userId: row.user_id,
        specialties: row.specialties || [],
        skillLevel: row.skill_level,
        maxCapacity: row.max_capacity,
        currentLoad: row.current_load,
        rating: Number(row.rating),
        status: row.status,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
        bankName: row.bank_name,
        accountNumber: row.account_number,
        accountName: row.account_name,
        workshopAddress: row.workshop_address,
        phoneNumber: row.phone_number,
        identificationUrl: row.identification_url,
    };
}

function mapOrder(row: any): DbOrder {
    const { id, user_id, status, total, created_at, updated_at, data } = row;
    return {
        id,
        userId: user_id,
        status,
        total: Number(total),
        createdAt: created_at?.toISOString() || new Date().toISOString(),
        updatedAt: updated_at?.toISOString() || new Date().toISOString(),
        ...data,
        commissionPaid: row.commission_paid || false,
    };
}

function mapAuditLog(row: any): DbAuditLog {
    return {
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email,
        action: row.action,
        resourceId: row.resource_id,
        details: row.details,
        timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
    };
}

function mapCommissionPayment(row: any): DbCommissionPayment {
    return {
        id: row.id,
        designerId: row.designer_id,
        amount: Number(row.amount),
        proofUrl: row.proof_url,
        status: row.status,
        notes: row.notes,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
}

function mapDispute(row: any): DbDispute {
    return {
        id: row.id,
        orderId: row.order_id,
        creatorId: row.creator_id,
        category: row.category,
        description: row.description,
        status: row.status,
        resolution: row.resolution,
        adminNotes: row.admin_notes,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
}

function mapDisputeEvidence(row: any): DbDisputeEvidence {
    return {
        id: row.id,
        disputeId: row.dispute_id,
        uploaderId: row.uploader_id,
        fileUrl: row.file_url,
        fileType: row.file_type,
        description: row.description,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    };
}

function mapEmailJob(row: any): DbEmailJob {
    return {
        id: row.id,
        recipient: row.recipient,
        subject: row.subject,
        htmlBody: row.html_body,
        status: row.status,
        attempts: row.attempts,
        nextAttemptAt: row.next_attempt_at?.toISOString() || new Date().toISOString(),
        error: row.error,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
        processedAt: row.processed_at?.toISOString()
    };
}

export async function readCollection<T>(collection: string): Promise<T[]> {
    try {
        if (collection === 'users') {
            const { rows } = await query('SELECT * FROM users');
            return rows.map(mapUser) as unknown as T[];
        } else if (collection === 'profiles') {
            const { rows } = await query('SELECT * FROM profiles');
            return rows.map(mapProfile) as unknown as T[];
        } else if (collection === 'designer_profiles') {
            const { rows } = await query('SELECT * FROM designer_profiles');
            return rows.map(mapDesignerProfile) as unknown as T[];
        } else if (collection === 'orders') {
            const { rows } = await query('SELECT * FROM orders');
            return rows.map(mapOrder) as unknown as T[];
        } else if (collection === 'commission_payments') {
            const { rows } = await query('SELECT * FROM commission_payments');
            return rows.map(mapCommissionPayment) as unknown as T[];
        } else if (collection === 'disputes') {
            const { rows } = await query('SELECT * FROM disputes');
            return rows.map(mapDispute) as unknown as T[];
        } else if (collection === 'dispute_evidence') {
            const { rows } = await query('SELECT * FROM dispute_evidence');
            return rows.map(mapDisputeEvidence) as unknown as T[];
        } else if (collection === 'email_queue') {
            const { rows } = await query('SELECT * FROM email_queue');
            return rows.map(mapEmailJob) as unknown as T[];
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${collection}:`, error);
        return [];
    }
}

export async function findById<T extends { id: string }>(
    collection: string,
    id: string
): Promise<T | null> {
    try {
        if (collection === 'users') {
            const { rows } = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapUser(rows[0]) as unknown as T) : null;
        } else if (collection === 'profiles') {
            const { rows } = await query('SELECT * FROM profiles WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapProfile(rows[0]) as unknown as T) : null;
        } else if (collection === 'designer_profiles') {
            const { rows } = await query('SELECT * FROM designer_profiles WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapDesignerProfile(rows[0]) as unknown as T) : null;
        } else if (collection === 'orders') {
            const { rows } = await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapOrder(rows[0]) as unknown as T) : null;
        } else if (collection === 'disputes') {
            const { rows } = await query('SELECT * FROM disputes WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapDispute(rows[0]) as unknown as T) : null;
        } else if (collection === 'dispute_evidence') {
            const { rows } = await query('SELECT * FROM dispute_evidence WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapDisputeEvidence(rows[0]) as unknown as T) : null;
        } else if (collection === 'commission_payments') {
            const { rows } = await query('SELECT * FROM commission_payments WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapCommissionPayment(rows[0]) as unknown as T) : null;
        }
        return null;
    } catch (error) {
        console.error(`Error finding by id in ${collection}:`, error);
        return null;
    }
}

export async function findByField<T>(
    collection: string,
    field: keyof T,
    value: unknown
): Promise<T | null> {
    try {
        if (collection === 'users' && field === 'email') {
            const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [value]);
            return rows.length ? (mapUser(rows[0]) as unknown as T) : null;
        }
        if (collection === 'designer_profiles' && field === 'userId') {
            const { rows } = await query('SELECT * FROM designer_profiles WHERE user_id = $1 LIMIT 1', [value]);
            return rows.length ? (mapDesignerProfile(rows[0]) as unknown as T) : null;
        }

        const all = await readCollection<T>(collection);
        return all.find((item) => item[field] === value) || null;
    } catch (error) {
        console.error(`Error finding by field ${String(field)} in ${collection}:`, error);
        return null;
    }
}

export async function findAllByField<T>(
    collection: string,
    field: keyof T,
    value: unknown
): Promise<T[]> {
    try {
        if (collection === 'orders' && field === 'userId') {
            const { rows } = await query('SELECT * FROM orders WHERE user_id = $1', [value]);
            return rows.map(mapOrder) as unknown as T[];
        }
        if (collection === 'profiles' && field === 'userId') {
            const { rows } = await query('SELECT * FROM profiles WHERE user_id = $1', [value]);
            return rows.map(mapProfile) as unknown as T[];
        }
        if (collection === 'designer_profiles' && field === 'status') {
            const { rows } = await query('SELECT * FROM designer_profiles WHERE status = $1', [value]);
            return rows.map(mapDesignerProfile) as unknown as T[];
        }
        if (collection === 'commission_payments' && field === 'designerId') {
            const { rows } = await query('SELECT * FROM commission_payments WHERE designer_id = $1 ORDER BY created_at DESC', [value]);
            return rows.map(mapCommissionPayment) as unknown as T[];
        }
        if (collection === 'disputes' && field === 'orderId') {
            const { rows } = await query('SELECT * FROM disputes WHERE order_id = $1', [value]);
            return rows.map(mapDispute) as unknown as T[];
        }
        if (collection === 'dispute_evidence' && field === 'disputeId') {
            const { rows } = await query('SELECT * FROM dispute_evidence WHERE dispute_id = $1', [value]);
            return rows.map(mapDisputeEvidence) as unknown as T[];
        }


        const all = await readCollection<T>(collection);
        return all.filter((item) => item[field] === value);
    } catch (error) {
        console.error(`Error finding all by field ${String(field)} in ${collection}:`, error);
        return [];
    }
}

export async function insertOne<T extends { id: string }>(
    collection: string,
    item: T
): Promise<T> {
    try {
        if (collection === 'users') {
            const u = item as unknown as DbUser;
            await query(
                'INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [u.id, u.email, u.passwordHash, u.firstName, u.lastName, u.role, u.createdAt]
            );
        } else if (collection === 'profiles') {
            const p = item as unknown as DbProfile;
            await query(
                'INSERT INTO profiles (id, user_id, name, gender, measurements, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [p.id, p.userId, p.name, p.gender, JSON.stringify(p.measurements), p.createdAt, p.updatedAt]
            );
        } else if (collection === 'designer_profiles') {
            const d = item as unknown as DbDesignerProfile;
            await query(
                'INSERT INTO designer_profiles (id, user_id, specialties, skill_level, max_capacity, current_load, rating, status, bank_name, account_number, account_name, workshop_address, phone_number, identification_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
                [d.id, d.userId, JSON.stringify(d.specialties), d.skillLevel, d.maxCapacity, d.currentLoad, d.rating, d.status, d.bankName, d.accountNumber, d.accountName, d.workshopAddress, d.phoneNumber, d.identificationUrl, d.createdAt, d.updatedAt]
            );
        } else if (collection === 'orders') {
            const o = item as unknown as DbOrder;
            const { id, userId, status, total, createdAt, updatedAt, ...rest } = o;
            await query(
                'INSERT INTO orders (id, user_id, status, total, created_at, updated_at, data) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [id, userId, status, total, createdAt, updatedAt, JSON.stringify(rest)]
            );
        } else if (collection === 'notifications') {
            const n = item as unknown as DbNotification;
            await query(
                'INSERT INTO notifications (id, user_id, type, message, read, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
                [n.id, n.userId, n.type, n.message, n.read, n.createdAt]
            );

        } else if (collection === 'commission_payments') {
            const c = item as unknown as DbCommissionPayment;
            await query(
                'INSERT INTO commission_payments (id, designer_id, amount, proof_url, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [c.id, c.designerId, c.amount, c.proofUrl, c.status, c.notes, c.createdAt, c.updatedAt]
            );
        } else if (collection === 'disputes') {
            const d = item as unknown as DbDispute;
            await query(
                'INSERT INTO disputes (id, order_id, creator_id, category, description, status, resolution, admin_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [d.id, d.orderId, d.creatorId, d.category, d.description, d.status, d.resolution, d.adminNotes, d.createdAt, d.updatedAt]
            );
        } else if (collection === 'dispute_evidence') {
            const e = item as unknown as DbDisputeEvidence;
            await query(
                'INSERT INTO dispute_evidence (id, dispute_id, uploader_id, file_url, file_type, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [e.id, e.disputeId, e.uploaderId, e.fileUrl, e.fileType, e.description, e.createdAt]
            );
        } else if (collection === 'email_queue') {
            const j = item as unknown as DbEmailJob;
            await query(
                'INSERT INTO email_queue (id, recipient, subject, html_body, status, attempts, next_attempt_at, error, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [j.id, j.recipient, j.subject, j.htmlBody, j.status, j.attempts, j.nextAttemptAt, j.error, j.createdAt]
            );
        }
        return item;
    } catch (error) {
        console.error(`Error inserting into ${collection}:`, error);
        throw error;
    }
}

export async function updateOne<T extends { id: string }>(
    collection: string,
    id: string,
    updates: Partial<T>
): Promise<T | null> {
    try {
        const existing = await findById<T>(collection, id);
        if (!existing) return null;

        const merged = { ...existing, ...updates };

        if (collection === 'users') {
            const u = merged as unknown as DbUser;
            await query(
                'UPDATE users SET email = $1, password_hash = $2, first_name = $3, last_name = $4, role = $5, status = $6, is_verified = $7 WHERE id = $8',
                [u.email, u.passwordHash, u.firstName, u.lastName, u.role, u.status, u.isVerified, id]
            );
        } else if (collection === 'profiles') {
            const p = merged as unknown as DbProfile;
            await query(
                'UPDATE profiles SET name = $1, gender = $2, measurements = $3, updated_at = $4 WHERE id = $5',
                [p.name, p.gender, JSON.stringify(p.measurements), new Date().toISOString(), id]
            );
        } else if (collection === 'designer_profiles') {
            const d = merged as unknown as DbDesignerProfile;
            await query(
                'UPDATE designer_profiles SET specialties = $1, skill_level = $2, max_capacity = $3, current_load = $4, rating = $5, status = $6, bank_name = $7, account_number = $8, account_name = $9, workshop_address = $10, phone_number = $11, identification_url = $12, updated_at = $13 WHERE id = $14',
                [JSON.stringify(d.specialties), d.skillLevel, d.maxCapacity, d.currentLoad, d.rating, d.status, d.bankName, d.accountNumber, d.accountName, d.workshopAddress, d.phoneNumber, d.identificationUrl, new Date().toISOString(), id]
            );
        } else if (collection === 'orders') {
            const o = merged as unknown as DbOrder;
            const { id: _id, userId, status, total, createdAt, updatedAt, ...rest } = o;
            await query(
                'UPDATE orders SET status = $1, total = $2, updated_at = $3, data = $4 WHERE id = $5',
                [status, total, new Date().toISOString(), JSON.stringify(rest), id]
            );
        } else if (collection === 'disputes') {
            const d = merged as unknown as DbDispute;
            await query(
                'UPDATE disputes SET status = $1, resolution = $2, admin_notes = $3, updated_at = $4 WHERE id = $5',
                [d.status, d.resolution, d.adminNotes, new Date().toISOString(), id]
            );
        } else if (collection === 'email_queue') {
            const j = merged as unknown as DbEmailJob;
            await query(
                'UPDATE email_queue SET status = $1, attempts = $2, next_attempt_at = $3, error = $4, processed_at = $5 WHERE id = $6',
                [j.status, j.attempts, j.nextAttemptAt, j.error, j.processedAt, id]
            );
        } else if (collection === 'commission_payments') {
            const c = merged as unknown as DbCommissionPayment;
            await query(
                'UPDATE commission_payments SET status = $1, notes = $2, updated_at = $3 WHERE id = $4',
                [c.status, c.notes, new Date().toISOString(), id]
            );
        }

        if ((merged as any).updatedAt) {
            (merged as any).updatedAt = new Date().toISOString();
        }
        return merged;

    } catch (error) {
        console.error(`Error updating ${collection}:`, error);
        return null;
    }
}

export async function deleteOne<T extends { id: string }>(
    collection: string,
    id: string
): Promise<boolean> {
    try {
        if (collection === 'users') {
            await query('DELETE FROM users WHERE id = $1', [id]);
        } else if (collection === 'profiles') {
            await query('DELETE FROM profiles WHERE id = $1', [id]);
        } else if (collection === 'designer_profiles') {
            await query('DELETE FROM designer_profiles WHERE id = $1', [id]);
        } else if (collection === 'orders') {
            await query('DELETE FROM orders WHERE id = $1', [id]);
        } else if (collection === 'disputes') {
            await query('DELETE FROM disputes WHERE id = $1', [id]);
        } else if (collection === 'dispute_evidence') {
            await query('DELETE FROM dispute_evidence WHERE id = $1', [id]);
        } else {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error deleting from ${collection}:`, error);
        return false;
    }
}

export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function logAudit(
    userId: string,
    action: string,
    details: string,
    resourceId?: string,
    userEmail?: string
) {
    try {
        await insertOne('audit_logs', {
            id: generateId(),
            userId,
            userEmail,
            action,
            resourceId,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("Failed to write audit log:", err);
    }
}
