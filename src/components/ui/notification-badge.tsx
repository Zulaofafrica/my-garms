
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
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.slice(0, 5).map(n => (
                            <Link
                                key={n.id}
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className={`flex flex-col gap-1 p-4 border-b hover:bg-muted/50 transition-colors ${!n.read ? 'bg-muted/20' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium leading-none">{n.type.replace('_', ' ').toUpperCase()}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {n.message}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
                <div className="p-2 border-t text-center">
                    <Link href="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline">
                        View All
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
