
"use client";

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api-client';
import { Wallet, CheckCircle, Clock, AlertTriangle, Search, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-modal';
import { format } from 'date-fns';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    bg: string;
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
}

export default function FinancePage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingRevenue: 0,
        totalGMV: 0,
        pendingCount: 0,
        approvedCount: 0
    });
    const [commissions, setCommissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved'
    const [searchQuery, setSearchQuery] = useState('');
    const toast = useToast();
    const { confirm } = useConfirm();

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsData, commissionsData] = await Promise.all([
                adminApi.getFinanceStats(),
                adminApi.getCommissions(filter === 'all' ? undefined : filter)
            ]);
            setStats(statsData);
            setCommissions(commissionsData.payments);
        } catch (error) {
            console.error("Failed to load finance data", error);
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmReceipt = async (id: string, amount: number, designerName: string) => {
        const confirmed = await confirm({
            title: "Confirm Commission Receipt",
            message: `Confirm that you have received ₦${amount.toLocaleString()} from ${designerName}?`,
            type: "success",
            confirmText: "Confirm Receipt",
            cancelText: "Cancel"
        });

        if (!confirmed) return;

        try {
            await adminApi.approveCommission(id);
            toast.success("Commission confirmed received");
            loadData(); // Reload to update lists and stats
        } catch (error) {
            toast.error("Failed to confirm receipt");
        }
    };

    const filteredCommissions = commissions.filter(c =>
        c.designerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.designerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Platform Revenue & Commissions</h1>
                <p className="text-slate-500">Track commissions paid by designers to the platform.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Revenue (Platform)"
                    value={`₦${stats.totalRevenue.toLocaleString()}`}
                    icon={Wallet}
                    color="text-green-600"
                    bg="bg-green-100"
                />
                <StatCard
                    label="Pending Revenue"
                    value={`₦${stats.pendingRevenue.toLocaleString()}`}
                    icon={Clock}
                    color="text-amber-600"
                    bg="bg-amber-100"
                />
                <StatCard
                    label="Gross Merchandise Value"
                    value={`₦${stats.totalGMV.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatCard
                    label="Commissions Received"
                    value={stats.approvedCount}
                    icon={CheckCircle}
                    color="text-purple-600"
                    bg="bg-purple-100"
                />
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['pending', 'approved', 'declined', 'all'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === f
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search designer..."
                        className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Designer</th>
                                <th className="px-6 py-4">Commission Amount</th>
                                <th className="px-6 py-4">Proof of Payment</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading records...</td>
                                </tr>
                            ) : filteredCommissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No records found.</td>
                                </tr>
                            ) : (
                                filteredCommissions.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                            <div className="text-xs text-slate-400">{format(new Date(item.createdAt), 'h:mm a')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{item.designerName}</div>
                                            <div className="text-xs text-slate-500">{item.designerEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            ₦{item.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.proofUrl ? (
                                                <a
                                                    href={item.proofUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-medium"
                                                >
                                                    View Receipt ↗
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">No proof</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleConfirmReceipt(item.id, item.amount, item.designerName)}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                                >
                                                    Confirm Receipt
                                                </button>
                                            )}
                                            {item.status === 'approved' && (
                                                <span className="text-slate-400 text-xs flex items-center justify-end gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Received
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
