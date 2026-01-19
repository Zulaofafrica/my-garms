
"use client";

import { useState, useEffect } from "react";
import { Order } from "@/lib/api-client";
import { Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Types for Admin View
interface AdminOrder extends Order {
    assignedDesignerName: string | null;
    candidateCount: number;
    assignmentStatus?: string;
}

interface DesignerOption {
    id: string; // userId
    name: string;
    currentLoad: number;
    maxCapacity: number;
    status: string;
}

export default function AdminAssignmentsPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [designers, setDesigners] = useState<DesignerOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch('/api/admin/assignments');
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
            if (data.designers) setDesigners(data.designers);
        } catch (error) {
            console.error("Failed to load admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (orderId: string, designerUserId: string) => {
        if (!designerUserId || !confirm(`Assign order ${orderId.slice(0, 8)} to this designer?`)) return;

        try {
            const res = await fetch('/api/admin/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, designerUserId })
            });
            if (res.ok) {
                alert("Assigned!");
                loadData(); // Reload
            } else {
                alert("Failed to assign");
            }
        } catch (e) {
            alert("Error assigning");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading Admin Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Assignment Control Center</h1>
                    <p className="text-slate-400">Monitor and override designer allocations.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-800 p-3 rounded-lg flex flex-col items-center min-w-[100px]">
                        <span className="text-2xl font-bold">{orders.filter(o => !o.assignedDesignerId).length}</span>
                        <span className="text-xs text-slate-400 uppercase">Unassigned</span>
                    </div>
                </div>
            </header>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer Request</th>
                            <th className="p-4">Shortlist Status</th>
                            <th className="p-4">Current Assignment</th>
                            <th className="p-4">Admin Override</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-700/50">
                                <td className="p-4 font-mono text-sm text-slate-500">{order.id.slice(0, 8)}</td>
                                <td className="p-4">
                                    <div className="font-medium text-white">{order.templateName || "Custom"}</div>
                                    <div className="text-sm text-slate-400">{order.fabricName}</div>
                                </td>
                                <td className="p-4">
                                    {order.assignmentStatus === 'shortlisted' ? (
                                        <span className="inline-flex items-center gap-1 text-amber-400 text-sm">
                                            <Clock size={16} /> Awaiting Accept ({order.candidateCount})
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 text-sm capitalize">{order.assignmentStatus || 'Open'}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {order.assignedDesignerId ? (
                                        <span className="inline-flex items-center gap-2 text-emerald-400 font-medium">
                                            <CheckCircle size={16} /> {order.assignedDesignerName}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <select
                                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:border-indigo-500 outline-none"
                                        onChange={(e) => handleAssign(order.id, e.target.value)}
                                        value=""
                                    >
                                        <option value="">Manual Assign...</option>
                                        {designers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} ({d.currentLoad}/{d.maxCapacity})
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
