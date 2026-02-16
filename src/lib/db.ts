
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
    // Address Fields
    address?: string;
    state?: string;
}

export interface DbAddress {
    id: string;
    userId: string;
    label: string; // 'Home', 'Work', 'Other'
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    isDefault: boolean;
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
    profilePhoto?: string;
    portfolioSamples?: string[];
    reviewCount: number;
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
    templateId?: string;
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
    commissionPaid?: boolean;
    rating?: number;
    review?: string;
}

export interface DbNotification {
    id: string;
    userId: string;
    type: 'system' | 'order_update' | 'request_received';
    message: string;
    read: boolean;
    createdAt: string;
}

export interface DbCuratedDesign {
    id: string;
    title: string;
    category: string;
    style_aesthetic: string;
    description: string;
    base_price_range: string;
    complexity_level: string;
    designer_skill_level: string;
    default_fabric: string;
    images: string[];
    is_active: boolean;
    admin_notes: string;
    created_at: string;
    updated_at: string;
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

export interface DbSystemSetting {
    key: string; // Acts as ID
    val: any;
    description?: string;
    updated_at: Date;
}

export interface DbFabric {
    id: string;
    name: string;
    type: string;
    price: number;
    image: string;
    color: string;
    description: string;
    inStock: boolean;
    createdAt?: string;
}

export interface DbTemplate {
    id: string;
    name: string;
    category: string;
    image?: string;
    basePrice?: number;
    description?: string;
    createdAt?: string;
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
        address: row.address,
        state: row.state,
    };
}

function mapFabric(row: any): DbFabric {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        price: Number(row.price),
        image: row.image,
        color: row.color,
        description: row.description,
        inStock: row.in_stock,
        createdAt: row.created_at
    };
}

function mapTemplate(row: any): DbTemplate {
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        image: row.image,
        basePrice: row.base_price ? Number(row.base_price) : undefined,
        description: row.description,
        createdAt: row.created_at
    };
}

function mapAddress(row: any): DbAddress {
    return {
        id: row.id,
        userId: row.user_id,
        label: row.label,
        fullName: row.full_name,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        isDefault: row.is_default,
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
        profilePhoto: row.profile_photo,
        portfolioSamples: row.portfolio_samples || [],
        reviewCount: row.review_count || 0,
    };
}

function mapOrder(row: any): DbOrder {
    const { id, user_id, status, total, created_at, updated_at, template_id, template_name, data } = row;
    return {
        id,
        userId: user_id,
        status,
        total: Number(total),
        createdAt: created_at?.toISOString() || new Date().toISOString(),
        updatedAt: updated_at?.toISOString() || new Date().toISOString(),
        templateId: template_id,
        templateName: template_name,
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

function mapNotification(row: any): DbNotification {
    return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        message: row.message,
        read: row.read,
        createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    };
}

function mapSystemSetting(row: any): DbSystemSetting {
    return {
        key: row.key,
        value: row.val, // 'value' is a reserved word in some SQL, so using 'val' in DB
        description: row.description,
        updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
    };
}

function mapCuratedDesign(row: any): DbCuratedDesign {
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        style_aesthetic: row.style_aesthetic,
        description: row.description,
        base_price_range: row.base_price_range,
        complexity_level: row.complexity_level,
        designer_skill_level: row.designer_skill_level,
        default_fabric: row.default_fabric,
        images: row.images || [],
        is_active: row.is_active,
        admin_notes: row.admin_notes,
        created_at: row.created_at?.toISOString() || new Date().toISOString(),
        updated_at: row.updated_at?.toISOString() || new Date().toISOString(),
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
        } else if (collection === 'audit_logs') {
            const { rows } = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
            return rows.map(mapAuditLog) as unknown as T[];
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
        } else if (collection === 'notifications') {
            const { rows } = await query('SELECT * FROM notifications');
            return rows.map(mapNotification) as unknown as T[];
        } else if (collection === 'curated_designs') {
            const { rows } = await query('SELECT * FROM curated_designs ORDER BY created_at DESC');
            return rows.map(mapCuratedDesign) as unknown as T[];
        } else if (collection === 'addresses') {
            const { rows } = await query('SELECT * FROM addresses');
            return rows.map(mapAddress) as unknown as T[];
        } else if (collection === 'system_settings') {
            const { rows } = await query('SELECT * FROM system_settings');
            return rows.map(mapSystemSetting) as unknown as T[];
        } else if (collection === 'fabrics') {
            const { rows } = await query('SELECT * FROM fabrics');
            return rows.map(mapFabric) as unknown as T[];
        } else if (collection === 'templates') {
            const { rows } = await query('SELECT * FROM templates');
            return rows.map(mapTemplate) as unknown as T[];
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
        } else if (collection === 'notifications') {
            const { rows } = await query('SELECT * FROM notifications WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapNotification(rows[0]) as unknown as T) : null;
        } else if (collection === 'curated_designs') {
            const { rows } = await query('SELECT * FROM curated_designs WHERE id = $1 LIMIT 1', [id]);
            return rows.length ? (mapCuratedDesign(rows[0]) as unknown as T) : null;
        } else if (collection === 'system_settings') {
            const { rows } = await query('SELECT * FROM system_settings WHERE key = $1 LIMIT 1', [id]);
            return rows.length ? (mapSystemSetting(rows[0]) as unknown as T) : null;
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
        if (collection === 'audit_logs' && field === 'resourceId') {
            const { rows } = await query('SELECT * FROM audit_logs WHERE resource_id = $1 ORDER BY timestamp DESC', [value]);
            return rows.map(mapAuditLog) as unknown as T[];
        }
        if (collection === 'addresses' && field === 'userId') {
            const { rows } = await query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [value]);
            return rows.map(mapAddress) as unknown as T[];
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
                'INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at, address, state) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [u.id, u.email, u.passwordHash, u.firstName, u.lastName, u.role, u.createdAt, u.address || null, u.state || null]
            );
        } else if (collection === 'addresses') {
            const a = item as unknown as DbAddress;
            await query(
                'INSERT INTO addresses (id, user_id, label, full_name, phone, address, city, state, is_default, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [a.id, a.userId, a.label, a.fullName, a.phone, a.address, a.city, a.state, a.isDefault, a.createdAt]
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
                'INSERT INTO designer_profiles (id, user_id, specialties, skill_level, max_capacity, current_load, rating, status, bank_name, account_number, account_name, workshop_address, phone_number, identification_url, profile_photo, portfolio_samples, review_count, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)',
                [d.id, d.userId, JSON.stringify(d.specialties), d.skillLevel, d.maxCapacity, d.currentLoad, d.rating, d.status, d.bankName, d.accountNumber, d.accountName, d.workshopAddress, d.phoneNumber, d.identificationUrl, d.profilePhoto, JSON.stringify(d.portfolioSamples || []), d.reviewCount || 0, d.createdAt, d.updatedAt]
            );
        } else if (collection === 'orders') {
            const o = item as unknown as DbOrder;
            const { id, userId, status, total, createdAt, updatedAt, templateId, templateName, ...rest } = o;
            await query(
                'INSERT INTO orders (id, user_id, status, total, created_at, updated_at, template_id, template_name, data) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [id, userId, status, total, createdAt, updatedAt, templateId || null, templateName || null, JSON.stringify(rest)]
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
        } else if (collection === 'audit_logs') {
            const l = item as unknown as DbAuditLog;
            await query(
                'INSERT INTO audit_logs (id, user_id, user_email, action, resource_id, details, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [l.id, l.userId, l.userEmail, l.action, l.resourceId, l.details, l.timestamp]
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
        } else if (collection === 'curated_designs') {
            const d = item as unknown as DbCuratedDesign;
            await query(
                'INSERT INTO curated_designs (id, title, category, style_aesthetic, description, base_price_range, complexity_level, designer_skill_level, default_fabric, images, is_active, admin_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                [d.id, d.title, d.category, d.style_aesthetic, d.description, d.base_price_range, d.complexity_level, d.designer_skill_level, d.default_fabric, JSON.stringify(d.images), d.is_active, d.admin_notes, d.created_at, d.updated_at]
            );
        } else if (collection === 'system_settings') {
            const s = item as unknown as DbSystemSetting;
            const queryText = `
                INSERT INTO system_settings (key, val, description, updated_at)
                VALUES ($1, $2, $3, NOW())
                RETURNING *
            `;
            const { rows } = await query(queryText, [s.key, JSON.stringify(s.val), s.description]);
            return mapSystemSetting(rows[0]) as unknown as T;
        } else if (collection === 'fabrics') {
            const f = item as unknown as DbFabric;
            const queryText = `
                INSERT INTO fabrics (id, name, type, price, image, color, description, in_stock, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                RETURNING *
            `;
            const { rows } = await query(queryText, [f.id, f.name, f.type, f.price, f.image, f.color, f.description, f.inStock !== false]);
            return mapFabric(rows[0]) as unknown as T;
        } else if (collection === 'templates') {
            const t = item as unknown as DbTemplate;
            const queryText = `
                INSERT INTO templates (id, name, category, image, base_price, description, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING *
            `;
            const { rows } = await query(queryText, [t.id, t.name, t.category, t.image, t.basePrice, t.description]);
            return mapTemplate(rows[0]) as unknown as T;
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
                'UPDATE designer_profiles SET specialties = $1, skill_level = $2, max_capacity = $3, current_load = $4, rating = $5, status = $6, bank_name = $7, account_number = $8, account_name = $9, workshop_address = $10, phone_number = $11, identification_url = $12, profile_photo = $13, portfolio_samples = $14, review_count = $15, updated_at = $16 WHERE id = $17',
                [JSON.stringify(d.specialties), d.skillLevel, d.maxCapacity, d.currentLoad, d.rating, d.status, d.bankName, d.accountNumber, d.accountName, d.workshopAddress, d.phoneNumber, d.identificationUrl, d.profilePhoto, JSON.stringify(d.portfolioSamples || []), d.reviewCount || 0, new Date().toISOString(), id]
            );
        } else if (collection === 'orders') {
            const o = merged as unknown as DbOrder;
            const { id: _id, userId, status, total, createdAt, updatedAt, templateId, templateName, ...rest } = o;
            await query(
                'UPDATE orders SET status = $1, total = $2, updated_at = $3, template_id = $4, template_name = $5, data = $6 WHERE id = $7',
                [status, total, new Date().toISOString(), templateId || null, templateName || null, JSON.stringify(rest), id]
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
        } else if (collection === 'notifications') {
            const n = merged as unknown as DbNotification;
            await query(
                'UPDATE notifications SET read = $1 WHERE id = $2',
                [n.read, id]
            );
        } else if (collection === 'curated_designs') {
            const d = merged as unknown as DbCuratedDesign;
            await query(
                'UPDATE curated_designs SET title = $1, category = $2, style_aesthetic = $3, description = $4, base_price_range = $5, complexity_level = $6, designer_skill_level = $7, default_fabric = $8, images = $9, is_active = $10, admin_notes = $11, updated_at = $12 WHERE id = $13',
                [d.title, d.category, d.style_aesthetic, d.description, d.base_price_range, d.complexity_level, d.designer_skill_level, d.default_fabric, JSON.stringify(d.images), d.is_active, d.admin_notes, new Date().toISOString(), id]
            );
        } else if (collection === 'system_settings') {
            const s = merged as unknown as DbSystemSetting;
            await query(
                'UPDATE system_settings SET val = $1, description = $2, updated_at = $3 WHERE key = $4',
                [JSON.stringify(s.value), s.description, new Date().toISOString(), id]
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
        } else if (collection === 'curated_designs') {
            await query('DELETE FROM curated_designs WHERE id = $1', [id]);
        } else if (collection === 'addresses') {
            await query('DELETE FROM addresses WHERE id = $1', [id]);
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

export function generateOrderId(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 4; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return result;
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
