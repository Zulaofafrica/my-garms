
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { designerApi, Order } from "@/lib/api-client";
import { ArrowLeft, Check, X, Clock, DollarSign, Shirt, Tag, Gauge, Zap, Layers } from "lucide-react";
import styles from "../../designer.module.css";
// Reuse designer.module.css assuming it exists, or use tailwind classes.
// Checked previous logs, designer.module.css exists.

export default function DesignerRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // orderId being acted on

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await designerApi.getRequests();
            setRequests(data.requests);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        if (!confirm("Are you sure you want to accept this order? You will be responsible for fulfilling it.")) return;

        setActionLoading(id);
        try {
            await designerApi.acceptRequest(id);
            alert("Order Accepted! Redirecting to order details...");
            router.push(`/designer/orders/${id}`);
        } catch (error) {
            alert("Failed to accept order: " + (error instanceof Error ? error.message : "Unknown error"));
            setActionLoading(null);
        }
    };

    const handleDecline = async (id: string) => {
        if (!confirm("Decline this request? It will be removed from your list.")) return;

        setActionLoading(id);
        try {
            await designerApi.declineRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            alert("Failed to decline");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading requests...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/designer')} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">New Design Requests</h1>
                        <p className="text-slate-400">Review and accept jobs matched to your profile</p>
                    </div>
                </div>

                {requests.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <Shirt className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No New Requests</h2>
                        <p className="text-slate-400">You're all caught up! Check back later for new matches.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map(request => (
                            <div key={request.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-indigo-500/50 transition-colors">
                                <div className="flex-grow space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium mb-2 border border-indigo-500/30">
                                                <Clock size={12} /> Expires in 24h
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                {request.templateName || "Custom Request"}
                                            </h3>
                                            <p className="text-slate-400 text-sm">
                                                Order ID: <span className="font-mono text-slate-500">#{request.id.slice(0, 8)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Tag size={10} /> Category
                                            </span>
                                            <span className="text-white font-medium capitalize">{request.category || "Unspecified"}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Shirt size={10} /> Fabric Source
                                            </span>
                                            <span className="text-white font-medium capitalize">{request.fabricSource || "Unsure"}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Gauge size={10} /> Complexity
                                            </span>
                                            <span className={`font-medium capitalize ${request.complexity === 'detailed' ? 'text-purple-400' : 'text-white'}`}>
                                                {request.complexity || "Moderate"}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Zap size={10} /> Urgency
                                            </span>
                                            <span className={`font-medium capitalize ${request.urgency === 'urgent' ? 'text-red-400' : 'text-white'}`}>
                                                {request.urgency || "Standard"}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Fabric Type</span>
                                            <span className="text-white font-medium">{request.fabricName}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Style</span>
                                            <span className="text-white font-medium">{request.style || "Standard"}</span>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Budget</span>
                                            <span className="text-white font-medium flex items-center gap-1">
                                                <DollarSign size={14} className="text-green-400" />
                                                {request.total > 0 ? `~₦${request.total.toLocaleString()}` : "To Quote"}
                                            </span>
                                        </div>
                                        {/* Images Preview */}
                                        {request.images && request.images.length > 0 && (
                                            <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                                                <img src={request.images[0]} alt="Ref" className="object-cover w-full h-full" />
                                                {request.images.length > 1 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs font-bold text-white">
                                                        +{request.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {request.notes && (
                                        <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                            <span className="text-xs text-slate-500 uppercase block mb-1">Customer Notes</span>
                                            <p className="text-slate-300 text-sm italic">"{request.notes}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex md:flex-col gap-3 justify-center min-w-[140px]">
                                    <button
                                        onClick={() => handleAccept(request.id)}
                                        disabled={!!actionLoading}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading === request.id ? (
                                            "Processing..."
                                        ) : (
                                            <>
                                                <Check size={18} /> Accept Job
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDecline(request.id)}
                                        disabled={!!actionLoading}
                                        className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
                                    >
                                        <X size={18} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
