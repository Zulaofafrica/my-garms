"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { DbDispute } from '@/lib/db'; // We can use the type if accessible, or define locally

// Minimal type definition for client if import fails or is server-only
interface Dispute {
    id: string;
    orderId: string;
    category: string;
    description: string;
    status: string;
    createdAt: string;
    resolution?: string;
}

export default function DisputesPage() {
    const router = useRouter();
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDisputes = async () => {
            try {
                const res = await fetch('/api/admin/disputes');
                const data = await res.json();
                if (data.success) {
                    setDisputes(data.disputes);
                }
            } catch (err) {
                console.error("Failed to load disputes", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDisputes();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading disputes...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Dispute Resolution Center
            </h1>

            <div className="space-y-4">
                {disputes.map((dispute) => (
                    <div
                        key={dispute.id}
                        className={`group relative p-6 rounded-xl border transition-all hover:shadow-md cursor-pointer
                            ${dispute.status === 'OPEN' || dispute.status === 'RESPONSE_REQUIRED'
                                ? 'bg-white border-red-200'
                                : 'bg-slate-50 border-slate-200 opacity-75'}`}
                        onClick={() => router.push(`/admin/disputes/${dispute.id}`)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                        ID: {dispute.id.slice(0, 8)}
                                    </span>
                                    {dispute.status === 'OPEN' ? (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">Action Required</span>
                                    ) : dispute.status === 'RESPONSE_REQUIRED' ? (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase tracking-wide flex items-center gap-1">
                                            <Clock size={12} /> Response Received
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Resolved</span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg text-slate-900 mb-1">{dispute.category}</h3>
                                <p className="text-slate-600 text-sm line-clamp-2">{dispute.description}</p>
                            </div>

                            <ArrowRight className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                        </div>

                        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                            <span>Order #{dispute.orderId.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{new Date(dispute.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}

                {disputes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">All Clear!</h3>
                        <p className="text-slate-500">No active disputes found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
