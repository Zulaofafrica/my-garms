
import { DbNotification } from "../lib/db";

// Simple client-side fetcher
export async function getNotifications(): Promise<DbNotification[]> {
    const res = await fetch('/api/notifications');
    if (!res.ok) return [];
    return res.json().then(d => d.notifications);
}

export async function markAsRead(id: string): Promise<boolean> {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.ok;
}
