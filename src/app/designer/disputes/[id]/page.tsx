"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlowButton } from "@/components/ui/glow-button";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { DisputeService } from "@/lib/dispute-service"; // We can't use service directly in client comp, need API
import { useToast } from "@/components/ui/toast";

interface DisputeResponsePageProps {
    params: Promise<{ id: string }>;
}

export default function DisputeResponsePage({ params }: DisputeResponsePageProps) {
    const router = useRouter();
    const toast = useToast();
    const [dispute, setDispute] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [action, setAction] = useState<'ACCEPT' | 'REJECT' | 'COUNTER'>('ACCEPT');
    const [comment, setComment] = useState("");
    const [evidence, setEvidence] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadDispute = async () => {
            try {
                const { id } = await params;
                // We don't have a direct GET /api/disputes/[id] yet for designer (customer one is order based)
                // We should probably add one or reuse the customer one if permissible, but designer needs specific access.
                // For MVP let's assume we can fetch via the order dispute endpoint if we pass the order ID, but here we only have dispute ID.
                // I need to implement GET /api/disputes/[id] for details.
                // ... Oh, I didn't implement GET /api/disputes/[id] in backend. I only did GET /api/orders/[id]/dispute.
                // I should probably start by implementing GET /api/disputes/[id] or just use the order one if I know the order ID.
                // But the URL here is /designer/disputes/[id] (dispute ID).

                // Workaround: I'll implement GET /api/disputes/[id] now or just mock it? 
                // No, I should implement it. 
                // Let's assume for this step I will create the UI and then fix the backend gap.
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        // loadDispute();
    }, [params]);

    const handleSubmit = async () => {
        if (!comment && action !== 'ACCEPT') {
            toast.warning("Please provide a comment.");
            return;
        }

        setIsSubmitting(true);
        try {
            const { id } = await params;
            const res = await fetch(`/api/disputes/${id}/response`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    comment: comment || (action === 'ACCEPT' ? 'Accepted responsibility.' : ''),
                    evidence: evidence.map(url => ({ cvUrl: url, type: 'image' }))
                })
            });

            if (!res.ok) throw new Error('Failed to submit response');

            toast.success("Response submitted.");
            router.push('/designer');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit response.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => router.back()} className="text-muted-foreground mb-6">Back</button>

                <h1 className="text-2xl font-bold text-white mb-6">Respond to Dispute</h1>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-2">Dispute Details</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        (Dispute details would load here from API - implementing fetch logic next)
                    </p>
                    {/* Placeholder for dispute details */}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold text-white">Your Response</h2>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setAction('ACCEPT')}
                            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                                ${action === 'ACCEPT' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
                        >
                            <CheckCircle className="w-6 h-6" />
                            <span className="font-bold">Accept</span>
                        </button>
                        <button
                            onClick={() => setAction('COUNTER')}
                            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                                ${action === 'COUNTER' ? 'bg-yellow-500/20 border-yellow-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
                        >
                            <MessageSquare className="w-6 h-6" />
                            <span className="font-bold">Discuss / Counter</span>
                        </button>
                        <button
                            onClick={() => setAction('REJECT')}
                            className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all
                                ${action === 'REJECT' ? 'bg-red-500/20 border-red-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400'}`}
                        >
                            <XCircle className="w-6 h-6" />
                            <span className="font-bold">Reject</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            {action === 'ACCEPT' ? 'Optional Comment' : 'Explanation (Required)'}
                        </label>
                        <textarea
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {(action === 'COUNTER' || action === 'REJECT') && (
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Evidence (Optional)</label>
                            <SimpleImageUpload
                                label="Upload Evidence"
                                onUpload={(url) => setEvidence([...evidence, url])}
                                value=""
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <GlowButton onClick={handleSubmit} disabled={isSubmitting} variant="primary">
                            Submit Response
                        </GlowButton>
                    </div>
                </div>
            </div>
        </main>
    );
}
