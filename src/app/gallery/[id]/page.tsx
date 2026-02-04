
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, CuratedDesign } from '@/lib/api-client';
import { GlowButton } from '@/components/ui/glow-button';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [design, setDesign] = useState<CuratedDesign | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDesign = async () => {
            if (params.id) {
                try {
                    // Reusing adminApi.getDesign because it works for public read (same endpoint)
                    // Or ideally create public specific function if auth differs, but assuming endpoint is public
                    // Wait, adminApi might be named "admin" but endpoints logic matters. 
                    // Let's use fetch directly to be safe or ensure public endpoint usage.
                    const res = await fetch(`/api/admin/designs/${params.id}`); // This is technically admin endpoint, might need public wrapper
                    // But actually public gallery detail needs public access. 
                    // The "admin" routes might check auth later. 
                    // I will just use the public list for now or assume admin route is unprotected for GET.
                    // BETTER: Create single fetch endpoint or filter from public list if list is small.
                    // OR: Create public detail endpoint `api/curated-designs/[id]`.

                    // Actually, for now let's try fetch from admin route, if it fails I'll fix.
                    // But `api/curated-designs` lists all. I can just fetch all and find one for MVP if list is small.
                    // Or create `api/curated-designs/[id]`.

                    const listRes = await fetch('/api/curated-designs');
                    const listData = await listRes.json();
                    const found = listData.designs.find((d: any) => d.id === params.id);
                    setDesign(found || null);
                } catch (error) {
                    console.error("Failed to load design", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchDesign();
    }, [params.id]);

    if (isLoading) return <div className="text-center text-white/50 py-20">Loading design...</div>;
    if (!design) return <div className="text-center text-white/50 py-20">Design not found.</div>;

    const imageUrl = design.images && design.images.length > 0 ? design.images[0] : '/placeholder-design.jpg';

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-slate-950">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Gallery
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Image Section */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/5] lg:aspect-square">
                        <img src={imageUrl} alt={design.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <span className="bg-indigo-500/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {design.category}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{design.title}</h1>
                            <p className="text-2xl text-indigo-400 font-light">{design.base_price_range}</p>
                        </div>

                        <div className="prose prose-invert max-w-none text-white/70">
                            <p>{design.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-xl border border-white/10">
                            <div>
                                <h4 className="text-xs text-white/40 uppercase tracking-widest mb-1">Aesthetic</h4>
                                <p className="font-medium text-white">{design.style_aesthetic || 'Standard'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs text-white/40 uppercase tracking-widest mb-1">Complexity</h4>
                                <p className="font-medium text-white">{design.complexity_level}</p>
                            </div>
                            <div>
                                <h4 className="text-xs text-white/40 uppercase tracking-widest mb-1">Rec. Fabric</h4>
                                <p className="font-medium text-white">{design.default_fabric || 'Any'}</p>
                            </div>
                            <div>
                                <h4 className="text-xs text-white/40 uppercase tracking-widest mb-1">Skill Level</h4>
                                <p className="font-medium text-white capitalize">{design.designer_skill_level}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-bold text-white">Why choose this style?</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start text-white/70">
                                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <span>Curated by top MyGarms stylists</span>
                                </li>
                                <li className="flex items-start text-white/70">
                                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <span>Verified production process</span>
                                </li>
                                <li className="flex items-start text-white/70">
                                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                                    <span>Includes fabric recommendations</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-8">
                            <GlowButton
                                variant="primary"
                                size="lg"
                                className="w-full md:w-auto"
                                onClick={() => router.push(`/design?templateId=${design.id}`)}
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Customize this Design
                            </GlowButton>
                            <p className="text-xs text-white/30 text-center md:text-left mt-4">
                                Starting this request will pre-fill your design wizard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
