"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface DisputeDetails {
    id: string;
    orderId: string;
    category: string;
    description: string;
    evidence: any[];
    status: string;
    adminNotes?: string;
    resolution?: string;
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function DisputeResolutionPage({ params }: PageProps) {
    const router = useRouter();
    const [dispute, setDispute] = useState<DisputeDetails | null>(null);
    const [resolutionText, setResolutionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadDispute = async () => {
            try {
                const { id } = await params;
                // Currently fetching from admin list or similar would be better, but we need details.
                // WE missed implementing GET /api/admin/disputes/[id]. 
                // I will mock fetch or assume I can get it from the list if I passed state (Next.js doesn't do history state easily).
                // I will rely on GET /api/orders/[orderId]/dispute if I knew the order ID, but I only have dispute ID.
                // Hotfix: I'll assume for now I added the endpoint or I can filter from the list API (inefficient but works for MVP).

                const res = await fetch('/api/admin/disputes'); // Fetch all for now...
                const data = await res.json();
                if (data.success) {
                    const found = data.disputes.find((d: any) => d.id === id);
                    if (found) {
                        // This list might not have evidence attached depending on implementation of readCollection
                        // Actually readCollection just maps rows, doesn't join evidence.
                        // I definitely need GET /api/admin/disputes/[id].
                        // I will create that endpoint next.
                        setDispute(found);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadDispute();
    }, [params]);

    const handleResolve = async (action: 'RESOLVE' | 'DISMISS') => {
        if (!resolutionText && action === 'RESOLVE') {
            alert("Resolution details required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { id } = await params;
            const res = await fetch(`/api/admin/disputes/${id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resolution: resolutionText,
                    status: action === 'RESOLVE' ? 'RESOLVED' : 'CLOSED',
                    notes: `Admin Action: ${action}`
                })
            });

            if (!res.ok) throw new Error('Failed');

            alert("Dispute resolved.");
            router.push('/admin/disputes');
        } catch (error) {
            alert("Failed to resolve.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!dispute) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{dispute.category}</span>
                            <h1 className="text-2xl font-bold text-slate-800 mt-2">Dispute #{dispute.id.slice(0, 8)}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Status</p>
                            <p className="font-bold">{dispute.status}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-bold uppercase text-slate-400 mb-3">Customer Report</h3>
                        <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{dispute.description}</p>

                        {/* Evidence would be here if fetched */}
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Evidence</h4>
                            <p className="text-xs text-slate-400 italic">No evidence loaded (Endpoint Needed)</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase text-slate-400 mb-3">Admin Resolution</h3>
                        {dispute.status === 'OPEN' || dispute.status === 'RESPONSE_REQUIRED' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Resolution Note</label>
                                    <textarea
                                        className="w-full border border-slate-300 rounded-lg p-3 min-h-[150px]"
                                        placeholder="Enter final decision details..."
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleResolve('RESOLVE')}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Resolve & Refund/Fix
                                    </button>
                                    <button
                                        onClick={() => handleResolve('DISMISS')}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-white border border-slate-300 text-slate-600 py-3 rounded-lg font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Dismiss Dispute
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
                                <p className="text-green-800 font-medium mb-1">Resolved</p>
                                <p className="text-green-700 text-sm">{dispute.resolution}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
