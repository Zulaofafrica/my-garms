
"use client";

import { useEffect, useState } from 'react';
import { adminApi, ordersApi, Order, User } from '@/lib/api-client';
import { Search, Filter, ShoppingBag, User as UserIcon, Check } from 'lucide-react';

export default function OrdersManagementPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [designers, setDesigners] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ordersData, usersData] = await Promise.all([
                    adminApi.getOrders(),
                    adminApi.getUsers()
                ]);
                setOrders(ordersData.orders);
                setDesigners(usersData.users.filter(u => u.role === 'designer'));
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleAssign = async (orderId: string, designerId: string) => {
        if (!designerId) return;
        setAssigningOrderId(orderId);
        try {
            await adminApi.assignDesigner(orderId, designerId);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, assignedDesignerId: designerId, assignmentStatus: 'assigned' } : o));
        } catch (err) {
            alert('Failed to assign designer');
        } finally {
            setAssigningOrderId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.fabricName && order.fabricName.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'unassigned') return !order.assignedDesignerId;
        if (filter === 'active') return order.status !== 'delivered' && order.status !== 'cancelled';
        if (filter === 'disputed') return order.disputeStatus === 'opened';
        return true;
    });

    if (isLoading) return <div>Loading orders...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Order Management</h1>
                <div className="flex gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'unassigned', 'active', 'disputed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-sm text-slate-500">#{order.id.slice(-6)}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    {order.disputeStatus === 'opened' && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                            Dispute Open
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg">{order.templateName} ({order.fabricName})</h3>
                                <p className="text-slate-600 text-sm mt-1">
                                    Total: ₦{order.total?.toLocaleString() ?? 0}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <label className="text-xs font-semibold text-slate-500 uppercase">Assigned Designer</label>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="w-full text-sm border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        value={order.assignedDesignerId || ''}
                                        disabled={assigningOrderId === order.id}
                                        onChange={(e) => handleAssign(order.id, e.target.value)}
                                    >
                                        <option value="">-- No Designer Assigned --</option>
                                        {designers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.firstName} {d.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {assigningOrderId === order.id && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                </div>
                                <div className="flex justify-end mt-2">
                                    <a href={`/admin/orders/${order.id}`} className="text-xs font-semibold text-primary hover:underline">
                                        View Full Details &rarr;
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
}
