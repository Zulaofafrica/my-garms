// API Client for MyGarms Backend

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
    }

    return data;
}

// Auth API
export const authApi = {
    signup: async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: 'customer' | 'designer';
    }) => {
        return fetchApi<{ user: User; message: string }>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: async (data: { email: string; password: string }) => {
        return fetchApi<{ user: User; message: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    logout: async () => {
        return fetchApi<{ message: string }>('/auth/logout', {
            method: 'POST',
        });
    },

    me: async () => {
        return fetchApi<{ user: User }>('/auth/me');
    },

    guestOrder: async (data: any) => {
        return fetchApi<{ success: boolean; message: string; orderId: string }>('/onboarding/guest-order', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Profiles API
export const profilesApi = {
    list: async () => {
        return fetchApi<{ profiles: Profile[] }>('/profiles');
    },

    create: async (data: { name: string; gender: 'male' | 'female'; measurements?: Record<string, string> }) => {
        return fetchApi<{ profile: Profile; message: string }>('/profiles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: Partial<Profile>) => {
        return fetchApi<{ profile: Profile; message: string }>(`/profiles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchApi<{ message: string }>(`/profiles/${id}`, {
            method: 'DELETE',
        });
    },
};

// Orders API
export const ordersApi = {
    list: async () => {
        return fetchApi<{ orders: Order[] }>('/orders');
    },

    create: async (data: {
        profileId: string;
        templateId: string;
        templateName: string;
        fabricId: string;
        fabricName: string;
        total: number;
        images?: string[];
        style?: string;
        color?: string;
        notes?: string;
    }) => {
        return fetchApi<{ order: Order; message: string }>('/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    approve: async (id: string) => {
        return fetchApi<{ order: Order; message: string }>(`/orders/${id}/approve`, {
            method: 'POST',
        });
    },

    submitPayment: async (id: string, data: {
        paymentType: 'full' | 'partial';
        proofUrl: string;
    }) => {
        return fetchApi<{ order: Order; message: string }>(`/orders/${id}/payment`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

// Designer API
export const designerApi = {
    listOrders: async () => {
        return fetchApi<{ orders: Order[] }>('/designer/orders');
    },

    getRequests: async () => {
        return fetchApi<{ requests: Order[] }>('/designer/requests');
    },

    acceptRequest: async (id: string) => {
        return fetchApi<{ success: boolean; message: string }>(`/designer/requests/${id}/accept`, {
            method: 'POST'
        });
    },

    declineRequest: async (id: string) => {
        return fetchApi<{ success: boolean; message: string }>(`/designer/requests/${id}/decline`, {
            method: 'POST'
        });
    },

    submitFeedback: async (orderId: string, data: {
        action: 'approve' | 'suggest_edit' | 'request_change' | 'set_price';
        comment: string;
        price?: number;
        attachmentUrl?: string;
    }) => {
        return fetchApi<{ order: Order; message: string }>(`/designer/orders/${orderId}/feedback`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getProfile: async (id: string) => {
        return fetchApi<{ profile: Profile }>(`/designer/profiles/${id}`);
    },

    confirmPayment: async (orderId: string, status: 'paid_70' | 'paid_100') => {
        return fetchApi<{ order: Order; message: string }>(`/designer/orders/${orderId}/payment-confirm`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        });
    },

    updateProduction: async (orderId: string, data: {
        stage: string;
        estimatedDate?: string;
        startDate?: string;
        endDate?: string;
    }) => {
        return fetchApi<{ order: Order; message: string }>(`/designer/orders/${orderId}/production`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getSettings: async () => {
        return fetchApi<{ profile: any }>('/designer/profile');
    },

    updateSettings: async (data: {
        specialties?: string[];
        maxCapacity?: number;
        status?: 'available' | 'busy' | 'offline';
    }) => {
        return fetchApi<{ success: true; profile: any }>('/designer/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// Types for API responses
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'customer' | 'designer';
    createdAt: string;
}

export interface Profile {
    id: string;
    userId: string;
    name: string;
    gender: 'male' | 'female';
    measurements: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface FeedbackLogEntry {
    id: string;
    userId: string;
    userName: string;
    action: 'approve' | 'suggest_edit' | 'request_change' | 'set_price';
    comment: string;
    attachmentUrl?: string; // Optional image attachment
    timestamp: string;
}

export interface Order {
    id: string;
    userId: string;
    profileId: string;
    templateId: string;
    templateName: string;
    fabricId: string;
    fabricName: string;
    status: 'pending' | 'reviewing' | 'changes_requested' | 'confirmed' | 'sewing' | 'shipping' | 'delivered';
    assignedDesignerId?: string;
    feedbackLog: FeedbackLogEntry[];
    total: number;
    price: number | null;
    images: string[];
    style?: string;
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
