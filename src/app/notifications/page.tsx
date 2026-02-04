
"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "@/lib/client-notifications";
import { DbNotification } from "@/lib/db";
import { Bell, Check, Loader2 } from "lucide-react";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getNotifications().then(data => {
            setNotifications(data);
            setIsLoading(false);
        });
    }, []);

    const handleMarkRead = async (id: string) => {
        const success = await markAsRead(id);
        if (success) {
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        }
    };

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="container mx-auto max-w-2xl py-8 px-4">
            <header className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-accent bg-gradient-to-r from-white to-slate-400">
                        Notifications
                    </h1>
                    <p className="text-slate-400">Stay updated on your orders and requests.</p>
                </div>
            </header>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-slate-500">You have no notifications.</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            className={`relative p-5 rounded-xl border transition-all ${!n.read
                                ? 'bg-slate-900 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                : 'bg-slate-900/20 border-slate-800 opacity-80 hover:opacity-100'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${n.type === 'order_update' ? 'bg-emerald-500 text-emerald-100' :
                                            n.type === 'request_received' ? 'bg-indigo-500/10 text-indigo-400' :
                                                'bg-slate-700 text-slate-300'
                                            }`}>
                                            {n.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-slate-200 leading-relaxed">{n.message}</p>
                                </div>
                                {!n.read && (
                                    <button
                                        onClick={() => handleMarkRead(n.id)}
                                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
