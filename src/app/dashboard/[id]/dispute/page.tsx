"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlowButton } from "@/components/ui/glow-button";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { ArrowLeft, AlertTriangle, Send, Upload } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface DisputePageProps {
    params: Promise<{ id: string }>;
}

export default function DisputePage({ params }: DisputePageProps) {
    const router = useRouter();
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [existingDispute, setExistingDispute] = useState<any>(null);

    // Form State
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [evidence, setEvidence] = useState<string[]>([]);

    useEffect(() => {
        const loadDispute = async () => {
            try {
                const { id } = await params;
                const res = await fetch(`/api/orders/${id}/dispute`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.dispute) {
                        setExistingDispute(data.dispute);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadDispute();
    }, [params]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const { id } = await params;
            const res = await fetch(`/api/orders/${id}/dispute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category,
                    description,
                    evidence: evidence.map(url => ({ cvUrl: url, type: 'image' }))
                })
            });

            if (!res.ok) throw new Error('Failed to submit dispute');

            toast.success("Dispute submitted successfully. We will review it shortly.");
            // Reload to show the status or fetch again
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit dispute.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-950 pt-24 text-white text-center">Loading...</div>;

    if (existingDispute) {
        return (
            <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Order
                    </button>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Dispute Status</h1>
                                <p className="text-muted-foreground">Tracking your reported issue.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-900 rounded-xl border border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-sm text-slate-400">Status</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${existingDispute.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                                        existingDispute.status === 'CLOSED' ? 'bg-slate-700 text-slate-300' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {existingDispute.status}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <span className="text-sm text-slate-400 block mb-1">Category</span>
                                    <span className="text-white font-medium">{existingDispute.category}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-400 block mb-1">Description</span>
                                    <p className="text-slate-200 text-sm whitespace-pre-wrap">{existingDispute.description}</p>
                                </div>
                            </div>

                            {existingDispute.resolution && (
                                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                                    <h3 className="text-green-400 font-bold mb-2 text-sm uppercase">Resolution</h3>
                                    <p className="text-green-100 text-sm">{existingDispute.resolution}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Order
                </button>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
                            <p className="text-muted-foreground">We're here to help resolve any problems.</p>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">What kind of issue are you facing?</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['Fit / Size Issue', 'Quality Issue', 'Design Mismatch', 'Timeline / Delay', 'Payment Issue', 'Other'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`p-4 rounded-xl border text-left transition-all
                                                ${category === cat
                                                    ? 'bg-red-500/20 border-red-500 text-white'
                                                    : 'bg-slate-900 border-white/10 text-slate-300 hover:border-white/20'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <GlowButton
                                    onClick={() => setStep(2)}
                                    disabled={!category}
                                    variant="primary"
                                >
                                    Next Step
                                </GlowButton>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Describe the issue in detail</label>
                                <textarea
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 transition-colors min-h-[150px]"
                                    placeholder="Please provide as much detail as possible..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">Evidence (Photos/Screenshots)</label>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {evidence.map((url, i) => (
                                        <div key={i} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-white/10">
                                            <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <SimpleImageUpload
                                    label="Upload Evidence"
                                    onUpload={(url) => setEvidence([...evidence, url])}
                                    value=""
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-muted-foreground hover:text-white"
                                >
                                    Back
                                </button>
                                <GlowButton
                                    onClick={handleSubmit}
                                    disabled={!description || isSubmitting}
                                    variant="primary"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Report"}
                                </GlowButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
