
"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, markAsRead } from "@/lib/client-notifications";
import { DbNotification } from "@/lib/db";
import Link from "next/link";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationBadge() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<DbNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const refresh = async () => {
        const list = await getNotifications();
        setNotifications(list);
        setUnreadCount(list.filter(n => !n.read).length);
    };

    // Poll every 1 minute
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            refresh(); // Refresh on open
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-slate-900 border-slate-700 shadow-xl z-50" align="end">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h4 className="font-semibold text-sm text-white">Notifications</h4>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            No notifications
                        </div>
                    ) : (
                        notifications.slice(0, 5).map(n => (
                            <Link
                                key={n.id}
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className={`flex flex-col gap-2 p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-indigo-500/5' : ''}`}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                                        {n.type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-slate-500 whitespace-nowrap">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                                    {n.message}
                                </p>
                                {!n.read && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                        <span className="text-xs text-indigo-400">New</span>
                                    </div>
                                )}
                            </Link>
                        ))
                    )}
                </div>
                <div className="p-3 border-t border-slate-700 text-center bg-slate-800/30">
                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        View All Notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
