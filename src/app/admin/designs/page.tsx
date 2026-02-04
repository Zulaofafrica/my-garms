
"use client";

import { useState, useEffect } from 'react';
import { adminApi, CuratedDesign } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/ui/glow-button';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-modal';

export default function AdminDesignsPage() {
    const router = useRouter();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [designs, setDesigns] = useState<CuratedDesign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDesigns();
    }, []);

    const loadDesigns = async () => {
        try {
            const data = await adminApi.getDesigns();
            setDesigns(data.designs || []);
        } catch (error) {
            console.error('Failed to load designs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (design: CuratedDesign) => {
        try {
            await adminApi.updateDesign(design.id, { is_active: !design.is_active });
            loadDesigns(); // Refresh
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const deleteDesign = async (id: string) => {
        const confirmed = await confirm({
            title: "Delete Design",
            message: "Are you sure you want to delete this design?",
            type: "danger",
            confirmText: "Delete",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

        try {
            await adminApi.deleteDesign(id);
            loadDesigns();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const filteredDesigns = designs.filter(d =>
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 text-slate-900 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-slate-900">Curated Designs</h1>
                    <p className="text-slate-500">Manage platform-owned design templates.</p>
                </div>
                <GlowButton variant="primary" onClick={() => router.push('/admin/designs/new')}>
                    <Plus className="w-4 h-4 mr-2" /> Add New Design
                </GlowButton>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search designs..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-slate-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDesigns.map((design) => (
                        <motion.div
                            key={design.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-slate-200 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="h-48 bg-slate-100 relative">
                                {design.images && design.images[0] ? (
                                    <img src={design.images[0]} alt={design.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${design.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {design.is_active ? 'Published' : 'Draft'}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{design.title}</h3>
                                        <p className="text-sm text-slate-500">{design.category} • {design.style_aesthetic}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 mb-4 line-clamp-2">
                                    {design.description}
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => router.push(`/admin/designs/${design.id}`)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200/80 py-2 rounded text-sm text-slate-700 transition-colors font-medium border border-transparent hover:border-slate-300"
                                    >
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(design)}
                                        className={`p-2 rounded hover:bg-slate-100 border border-transparent hover:border-slate-300 transition-all ${design.is_active ? 'text-yellow-600' : 'text-green-600'}`}
                                        title={design.is_active ? "Unpublish" : "Publish"}
                                    >
                                        {design.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => deleteDesign(design.id)}
                                        className="p-2 rounded hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredDesigns.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No designs found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
