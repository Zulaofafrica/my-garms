
import { sql } from '@vercel/postgres';

// Database model types (exported for use in app)
export interface DbUser {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'designer';
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
    userId: string; // The designer who gave feedback
    userName: string;
    action: 'approve' | 'suggest_edit' | 'request_change' | 'set_price';
    comment: string;
    attachmentUrl?: string; // Optional image attachment
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
    status: 'pending' | 'reviewing' | 'changes_requested' | 'confirmed' | 'sewing' | 'shipping' | 'delivered';
    assignedDesignerId?: string;
    feedbackLog: FeedbackEntry[];
    total: number;
    price: number | null; // Null means "Calculating..."
    images: string[];
    style?: string;
    color?: string;
    notes?: string;
    // Payment & Production
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

// Helper to convert DB rows to application objects
function mapUser(row: any): DbUser {
    return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
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

function mapOrder(row: any): DbOrder {
    const { id, user_id, status, total, created_at, updated_at, data } = row;
    return {
        id,
        userId: user_id,
        status,
        total: Number(total),
        createdAt: created_at?.toISOString() || new Date().toISOString(),
        updatedAt: updated_at?.toISOString() || new Date().toISOString(),
        ...data, // Spread the JSONB data
    };
}

// Generic read (List all)
// Note: This scans the whole table. Okay for MVP/small scale.
export async function readCollection<T>(collection: string): Promise<T[]> {
    try {
        if (collection === 'users') {
            const { rows } = await sql`SELECT * FROM users`;
            return rows.map(mapUser) as unknown as T[];
        } else if (collection === 'profiles') {
            const { rows } = await sql`SELECT * FROM profiles`;
            return rows.map(mapProfile) as unknown as T[];
        } else if (collection === 'orders') {
            const { rows } = await sql`SELECT * FROM orders`;
            return rows.map(mapOrder) as unknown as T[];
        }
        return [];
    } catch (error) {
        console.error(`Error reading existing collection ${collection}:`, error);
        return [];
    }
}

// Deprecated in favor of direct DB manipulation, but kept for compatibility potential
// We do NOT implement writeCollection as "overwrite everything" anymore.
export async function writeCollection<T>(collection: string, data: T[]): Promise<void> {
    throw new Error('writeCollection is deprecated. Use insertOne, updateOne, or deleteOne.');
}

export async function findById<T extends { id: string }>(
    collection: string,
    id: string
): Promise<T | null> {
    try {
        if (collection === 'users') {
            const { rows } = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
            return rows.length ? (mapUser(rows[0]) as unknown as T) : null;
        } else if (collection === 'profiles') {
            const { rows } = await sql`SELECT * FROM profiles WHERE id = ${id} LIMIT 1`;
            return rows.length ? (mapProfile(rows[0]) as unknown as T) : null;
        } else if (collection === 'orders') {
            const { rows } = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
            return rows.length ? (mapOrder(rows[0]) as unknown as T) : null;
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
        // Warning: This builds raw SQL queries for field names. 
        // Ensure 'field' is strictly controlled by strict typing in app code.
        // For MVP we map common fields manually to be safe.

        if (collection === 'users') {
            // Safe mappings for user search fields
            if (field === 'email') {
                const { rows } = await sql`SELECT * FROM users WHERE email = ${value as string} LIMIT 1`;
                return rows.length ? (mapUser(rows[0]) as unknown as T) : null;
            }
        }

        // Fallback to in-memory filter if field not indexed/mapped (Inefficient but safe for MVP transition)
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
        // Optimized paths
        if (collection === 'orders' && field === 'userId') {
            const { rows } = await sql`SELECT * FROM orders WHERE user_id = ${value as string}`;
            return rows.map(mapOrder) as unknown as T[];
        }
        if (collection === 'profiles' && field === 'userId') {
            const { rows } = await sql`SELECT * FROM profiles WHERE user_id = ${value as string}`;
            return rows.map(mapProfile) as unknown as T[];
        }

        // Fallback
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
            await sql`
                INSERT INTO users (id, email, password_hash, first_name, last_name, role, created_at)
                VALUES (${u.id}, ${u.email}, ${u.passwordHash}, ${u.firstName}, ${u.lastName}, ${u.role}, ${u.createdAt})
            `;
        } else if (collection === 'profiles') {
            const p = item as unknown as DbProfile;
            await sql`
                INSERT INTO profiles (id, user_id, name, gender, measurements, created_at, updated_at)
                VALUES (${p.id}, ${p.userId}, ${p.name}, ${p.gender}, ${JSON.stringify(p.measurements)}, ${p.createdAt}, ${p.updatedAt})
            `;
        } else if (collection === 'orders') {
            const o = item as unknown as DbOrder;
            const { id, userId, status, total, createdAt, updatedAt, ...rest } = o;
            await sql`
                INSERT INTO orders (id, user_id, status, total, created_at, updated_at, data)
                VALUES (${id}, ${userId}, ${status}, ${total}, ${createdAt}, ${updatedAt}, ${JSON.stringify(rest)})
            `;
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
        // We first fetch the existing item to merge locally, 
        // because our JSONB 'data' method requires rewriting the whole JSON object for simple JSON fields in SQL (usually)
        // or we can use specific JSONB set operations, but deep merge is complex in pure SQL.
        // For 'users' and 'profiles' (relational fields), we could issue UPDATE.

        const existing = await findById<T>(collection, id);
        if (!existing) return null;

        const merged = { ...existing, ...updates };

        if (collection === 'users') {
            const u = merged as unknown as DbUser;
            await sql`
                UPDATE users SET 
                    email = ${u.email}, 
                    password_hash = ${u.passwordHash}, 
                    first_name = ${u.firstName}, 
                    last_name = ${u.lastName}, 
                    role = ${u.role}
                WHERE id = ${id}
            `;
        } else if (collection === 'profiles') {
            const p = merged as unknown as DbProfile;
            await sql`
                UPDATE profiles SET 
                    name = ${p.name}, 
                    gender = ${p.gender}, 
                    measurements = ${JSON.stringify(p.measurements)}, 
                    updated_at = ${new Date().toISOString()}
                WHERE id = ${id}
            `;
        } else if (collection === 'orders') {
            const o = merged as unknown as DbOrder;
            const { id: _id, userId, status, total, createdAt, updatedAt, ...rest } = o;
            // Update relations and the data blob
            await sql`
                UPDATE orders SET 
                    status = ${status}, 
                    total = ${total}, 
                    updated_at = ${new Date().toISOString()}, 
                    data = ${JSON.stringify(rest)}
                WHERE id = ${id}
            `;
        }

        // Return the fresh merged object with updated timestamp
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
            await sql`DELETE FROM users WHERE id = ${id}`;
        } else if (collection === 'profiles') {
            await sql`DELETE FROM profiles WHERE id = ${id}`;
        } else if (collection === 'orders') {
            await sql`DELETE FROM orders WHERE id = ${id}`;
        } else {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`Error deleting from ${collection}:`, error);
        return false;
    }
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
