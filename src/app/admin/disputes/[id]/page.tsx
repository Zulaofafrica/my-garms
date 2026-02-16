"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

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
    const toast = useToast();
    const [dispute, setDispute] = useState<DisputeDetails | null>(null);
    const [resolutionText, setResolutionText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadDispute = async () => {
            try {
                const { id } = await params;
                const res = await fetch(`/api/admin/disputes/${id}`);
                const data = await res.json();

                if (data.success) {
                    setDispute(data.dispute);
                } else {
                    toast.error(data.error || "Failed to load dispute");
                }
            } catch (err) {
                console.error(err);
                toast.error("Network error loading dispute");
            }
        };
        loadDispute();
    }, [params, toast]);

    const handleResolve = async (action: 'RESOLVE' | 'DISMISS') => {
        if (!resolutionText && action === 'RESOLVE') {
            toast.warning("Resolution details required.");
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

            toast.success("Dispute resolved.");
            router.push('/admin/disputes');
        } catch (error) {
            toast.error("Failed to resolve.");
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

                        {/* Evidence Section */}
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-400 mb-2">Evidence</h4>
                            {dispute.evidence && dispute.evidence.length > 0 ? (
                                <div className="space-y-2">
                                    {dispute.evidence.map((ev: any) => (
                                        <div key={ev.id} className="text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                {ev.fileUrl}
                                            </a>
                                            {ev.description && <p className="text-xs text-slate-500 mt-1">{ev.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">No evidence uploaded</p>
                            )}
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
