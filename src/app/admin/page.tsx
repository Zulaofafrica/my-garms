
"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api-client';
import { Users, ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeOrders: 0,
        openDisputes: 0,
        completedOrders: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersData, ordersData] = await Promise.all([
                    adminApi.getUsers(),
                    adminApi.getOrders()
                ]);

                setStats({
                    totalUsers: usersData.users.length,
                    activeOrders: ordersData.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length,
                    openDisputes: ordersData.orders.filter(o => o.disputeStatus === 'opened').length,
                    completedOrders: ordersData.orders.filter(o => o.status === 'delivered').length
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <div>Loading dashboard...</div>;

    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Orders', value: stats.activeOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Open Disputes', value: stats.openDisputes, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${card.bg}`}>
                                    <Icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold mb-4 text-slate-800">Quick Actions</h2>
                <div className="flex gap-4">
                    <Link href="/admin/orders">
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium">
                            View New Orders
                        </button>
                    </Link>
                    <Link href="/admin/users">
                        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium">
                            Manage Users
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
