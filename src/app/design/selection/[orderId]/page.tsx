"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { GlowButton } from "@/components/ui/glow-button";
import { ordersApi } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, UserCheck, Star, Clock, CheckCircle, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function SelectionPage({ params }: { params: Promise<{ orderId: string }> }) {
    const router = useRouter();
    const toast = useToast();
    const { orderId } = use(params);

    const [mode, setMode] = useState<'initial' | 'manual' | 'success'>('initial');
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(null);

    // Initial load: Verify order status to prevent double-submission
    useEffect(() => {
        const checkOrderStatus = async () => {
            try {
                const { order } = await ordersApi.get(orderId);
                if (order.assignmentStatus && ['shortlisted', 'assigned'].includes(order.assignmentStatus)) {
                    setMode('success');
                }
            } catch (error) {
                console.error("Failed to check order status:", error);
            }
        };
        checkOrderStatus();
    }, [orderId]);

    const handleAutoMatch = async () => {
        setIsLoading(true);
        try {
            await ordersApi.confirmSelection(orderId, { method: 'auto' });
            setMode('success');
        } catch (error: any) {
            console.error("Auto match failed", error);
            // If already processed, treat as success
            if (error.message?.includes('already processing')) {
                setMode('success');
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualMode = async () => {
        setIsLoading(true);
        try {
            const data = await ordersApi.getMatches(orderId);
            setMatches(data.matches);
            setMode('manual');
        } catch (error) {
            console.error("Fetch matches failed", error);
            toast.error("Could not load designers");
        } finally {
            setIsLoading(false);
        }
    };

    const confirmManualSelection = async () => {
        if (!selectedDesignerId) return;
        setIsLoading(true);
        try {
            await ordersApi.confirmSelection(orderId, {
                method: 'manual',
                designerId: selectedDesignerId
            });
            setMode('success');
        } catch (error: any) {
            console.error("Manual selection failed", error);
            // If already processed, treat as success
            if (error.message?.includes('already processing')) {
                setMode('success');
            } else {
                toast.error("Selection failed");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (mode === 'success') {
        return (
            <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-slate-900/50 border border-white/10 rounded-2xl p-8 text-center"
                >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Designer Assigned!</h1>
                    <p className="text-slate-400 mb-8">
                        We have notified the designer. You can now track your order status in your dashboard.
                    </p>
                    <GlowButton onClick={() => router.push('/profile')} variant="primary" className="w-full">
                        Go to Dashboard
                    </GlowButton>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-2">Choose Your Designer</h1>
                    <p className="text-slate-400">Select how you want to be paired with a fashion expert</p>
                </header>

                {mode === 'initial' && (
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Option A: Auto */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden group cursor-pointer"
                            onClick={handleAutoMatch}
                        >
                            <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                            <div className="relative z-10 flex flex-col h-full items-center text-center">
                                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Let MyGarms Pick</h3>
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium mb-4">
                                    Recommended
                                </div>
                                <p className="text-slate-300 mb-8 flex-grow">
                                    Our AI matches you with the perfect designer based on your style, budget, and timeline. Best for speed and quality assurance.
                                </p>
                                <GlowButton isLoading={isLoading} className="w-full">
                                    Select Automatically
                                </GlowButton>
                            </div>
                        </motion.div>

                        {/* Option B: Manual */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden group cursor-pointer"
                            onClick={handleManualMode}
                        >
                            <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                            <div className="relative z-10 flex flex-col h-full items-center text-center">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                                    <UserCheck className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">I Want to Choose</h3>
                                <p className="text-slate-400 mb-11 flex-grow">
                                    Browse a curated list of top-rated designers who match your criteria and pick your favorite manually.
                                </p>
                                <GlowButton variant="secondary" isLoading={isLoading} className="w-full">
                                    Browse Designers
                                </GlowButton>
                            </div>
                        </motion.div>
                    </div>
                )}

                {mode === 'manual' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Top Matches for You</h2>
                            <button
                                onClick={() => setMode('initial')}
                                className="text-sm text-slate-400 hover:text-white"
                            >
                                Change method
                            </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {matches.map((designer) => (
                                <motion.div
                                    key={designer.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedDesignerId(designer.id)}
                                    className={`relative bg-slate-900/80 border rounded-xl overflow-hidden cursor-pointer transition-all ${selectedDesignerId === designer.id
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="h-32 bg-slate-800 relative">
                                        {/* Cover / Patterns */}
                                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-950" />
                                    </div>
                                    <div className="px-6 pb-6 -mt-10 relative">
                                        <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center overflow-hidden mb-4">
                                            {designer.photoUrl ? (
                                                <img src={designer.photoUrl} alt={designer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-slate-500">{designer.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-white text-lg">{designer.name}</h3>
                                        <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span>{designer.rating.toFixed(1)}</span>
                                            <span className="text-slate-500 ml-1">({designer.reviewCount || 0} reviews)</span>
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-400 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                Run time: {designer.estimatedTurnaround}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                {designer.location}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {designer.specialties.slice(0, 3).map((tag: string) => (
                                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-300 capitalize">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <button className={`w-full py-2 rounded-lg font-medium transition-colors ${selectedDesignerId === designer.id
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}>
                                            {selectedDesignerId === designer.id ? 'Selected' : 'Select Designer'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-end">
                            <GlowButton
                                onClick={confirmManualSelection}
                                disabled={!selectedDesignerId}
                                className="w-full md:w-auto"
                            >
                                Confirm Selection
                            </GlowButton>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
