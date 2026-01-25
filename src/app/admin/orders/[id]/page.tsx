
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, ShoppingBag, Ruler, Clock, Calendar, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { adminApi } from '@/lib/api-client';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAssigning, setIsAssigning] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [params.id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/admin/orders/${params.id}/details`);
            if (!res.ok) throw new Error('Failed to load');
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
            alert('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async (designerId: string) => {
        if (!confirm('Assign this designer to the order?')) return;
        setIsAssigning(true);
        try {
            await adminApi.assignDesigner(params.id as string, designerId);
            fetchDetails(); // Reload to see updates
        } catch (err) {
            alert('Failed to assign designer');
        } finally {
            setIsAssigning(false);
        }
    };

    if (isLoading) return <div className="p-8">Loading details...</div>;
    if (!data) return <div className="p-8">Order not found</div>;

    const { order, customer, profile, assignedDesigner, recommendedDesigners, logs } = data;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Orders
            </button>

            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-slate-500">#{order.id.slice(0, 8)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status.replace('_', ' ')}
                        </span>
                        {order.disputeStatus === 'opened' && (
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
                                <AlertTriangle size={12} /> Dispute Active
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{order.templateName}</h1>
                    <p className="text-slate-500 text-sm">Created on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500">Total Value</p>
                    <p className="text-3xl font-bold text-slate-900">₦{(order.total || 0).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Assignment & Logistics */}
                <div className="space-y-6">
                    {/* Current Assignment */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <User size={16} /> Assigned Designer
                        </h3>
                        {assignedDesigner ? (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                        {assignedDesigner.user.firstName[0]}{assignedDesigner.user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{assignedDesigner.user.firstName} {assignedDesigner.user.lastName}</p>
                                        <p className="text-xs text-slate-500">{assignedDesigner.user.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-white p-2 rounded border border-slate-100">
                                        <p className="text-slate-400">Status</p>
                                        <p className="font-medium capitalize">{assignedDesigner.profile.status}</p>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-100">
                                        <p className="text-slate-400">Load</p>
                                        <p className="font-medium">{assignedDesigner.profile.currentLoad} / {assignedDesigner.profile.maxCapacity}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm">
                                <div className="flex items-start gap-2 mb-3">
                                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                    <p>No designer currently assigned to this order.</p>
                                </div>

                                {/* Manual Assignment Dropdown */}
                                <div className="bg-white p-3 rounded border border-amber-200 shadow-sm">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Manual Assignment</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 text-sm border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-slate-400 text-slate-700"
                                            onChange={(e) => {
                                                if (e.target.value) handleAssign(e.target.value);
                                            }}
                                            value=""
                                            disabled={isAssigning}
                                        >
                                            <option value="">Select a designer...</option>
                                            {data.allDesigners?.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recommendation Engine */}
                    {!assignedDesigner && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <CheckCircle size={16} /> Recommended Designers
                            </h3>
                            <div className="space-y-3">
                                {recommendedDesigners.length > 0 ? recommendedDesigners.map((d: any) => (
                                    <div key={d.id} className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-colors bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-sm">{d.firstName} {d.lastName}</p>
                                                <div className="flex gap-1 mt-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold text-slate-600">
                                                        {d.skillLevel}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold">
                                                        Load: {d.currentLoad}/{d.maxCapacity}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAssign(d.userId)}
                                                disabled={isAssigning}
                                                className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded hover:bg-slate-700 disabled:opacity-50"
                                            >
                                                Assign
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {d.specialties.map((s: string) => (
                                                <span key={s} className="text-[10px] text-slate-500 bg-slate-50 px-1 rounded">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 italic">No exact matches found for these requirements.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <ShoppingBag size={16} /> Logistics
                        </h3>
                        {order.deliveryDetails ? (
                            <div className="text-sm space-y-2">
                                <p><span className="text-slate-500">Recipient:</span> <span className="font-medium">{order.deliveryDetails.fullName}</span></p>
                                <p><span className="text-slate-500">Phone:</span> <span className="font-medium">{order.deliveryDetails.phone}</span></p>
                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <p className="text-slate-800">{order.deliveryDetails.address}</p>
                                    <p className="text-slate-500">{order.deliveryDetails.city}, {order.deliveryDetails.state}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Delivery details not yet provided (Pending Customer).</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Specs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <User size={16} /> Customer Details
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Name</p>
                                <p className="font-medium text-lg">{customer?.firstName} {customer?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase">Email</p>
                                <p className="font-medium">{customer?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Requirements & Specs */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Ruler size={16} /> Specifications
                        </h3>

                        <div className="grid sm:grid-cols-3 gap-6 mb-8">
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Category</p>
                                <p className="font-medium capitalize">{order.category || 'Custom'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Fabric</p>
                                <p className="font-medium">{order.fabricName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Budget</p>
                                <p className="font-medium capitalize">{order.budgetRange || 'Standard'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Complexity</p>
                                <p className="font-medium capitalize">{order.complexity || 'Moderate'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Urgency</p>
                                <p className="font-medium capitalize">{order.urgency || 'Standard'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase mb-1">Style/Aesthetic</p>
                                <p className="font-medium capitalize">{order.style || 'None'}</p>
                            </div>
                        </div>

                        {/* Measurements */}
                        <div className="mb-8">
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">Measurements ({profile?.name})</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {profile?.measurements && Object.entries(profile.measurements).slice(0, 8).map(([key, val]) => (
                                    <div key={key} className="bg-slate-50 p-2 rounded">
                                        <p className="text-[10px] text-slate-500 uppercase">{key}</p>
                                        <p className="font-mono font-medium">{val as string}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        {order.images && order.images.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2">Reference Images</h4>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {order.images.map((img: string, i: number) => (
                                        <div key={i} className="w-32 h-32 bg-slate-100 rounded-lg shrink-0 overflow-hidden border border-slate-200">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="Reference" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Audit Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Clock size={16} /> Activity Log
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {logs && logs.length > 0 ? logs.map((log: any) => (
                                <div key={log.id} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                                    <p className="text-sm font-medium text-slate-800">{log.action.replace('_', ' ')}</p>
                                    <p className="text-xs text-slate-500">{log.details}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            )) : (
                                <p className="pl-8 text-sm text-slate-500 italic">No activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
