"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronRight,
    Search,
    Briefcase
} from "lucide-react";
import { designerApi, authApi, Order, User } from "@/lib/api-client";
import styles from "./designer.module.css";
import Link from "next/link";

export default function DesignerDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Check auth and role
                const me = await authApi.me();
                if (me.user.role !== 'designer') {
                    router.push("/profile");
                    return;
                }
                setUser(me.user);

                // Load orders
                const data = await designerApi.listOrders();
                setOrders(data.orders);
            } catch (err) {
                console.error("Dashboard load error:", err);
                router.push("/auth/login");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [router]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fabricName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        reviewing: orders.filter(o => o.status === 'reviewing').length,
        changes: orders.filter(o => o.status === 'changes_requested').length,
        total: orders.length
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Designer Portal</h1>
                    <p className={styles.subtitle}>Manage and review custom design requests.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/designer/settings" className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors" title="Settings">
                        <Briefcase size={20} />
                    </Link>
                    <div className={styles.userBadge}>
                        <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
                        <span className={styles.userRole}>Master Designer</span>
                    </div>
                </div>
            </header>

            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">New Design Matches Available!</h3>
                    <p className="text-indigo-200">There are new customer requests waiting for your review.</p>
                </div>
                <Link
                    href="/designer/requests"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <ClipboardList size={20} />
                    View New Requests
                </Link>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.pending}</span>
                    <span className={styles.statLabel}>Pending Assignment</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.reviewing}</span>
                    <span className={styles.statLabel}>In Review</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.changes}</span>
                    <span className={styles.statLabel}>Changes Requested</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>My Active Orders</span>
                </div>
            </div>

            <section className={styles.ordersSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Active Requests</h2>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by ID or template..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.orderList}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/designer/orders/${order.id}`}
                                className={styles.orderItem}
                            >
                                <div className={styles.orderIcon}>
                                    <ClipboardList size={24} />
                                </div>
                                <div className={styles.orderInfo}>
                                    <span className={styles.orderId}>{order.id}</span>
                                    <h3 className={styles.orderTitle}>{order.templateName}</h3>
                                    <span className={styles.orderMeta}>
                                        Fabric: {order.fabricName} • {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.orderStatus}>
                                    <span className={`${styles.statusBadge} ${styles['status_' + order.status]}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <ChevronRight size={20} className={styles.chevron} />
                            </Link>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No requests found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
