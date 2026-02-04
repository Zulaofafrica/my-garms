
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, CuratedDesign } from '@/lib/api-client';
import { GlowButton } from '@/components/ui/glow-button';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface DesignFormProps {
    initialData?: Partial<CuratedDesign>;
    isEdit?: boolean;
    onSubmit: (data: any) => Promise<void>;
}

export function DesignForm({ initialData, isEdit, onSubmit }: DesignFormProps) {
    const toast = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<string[]>(initialData?.images || []);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        category: initialData?.category || '',
        style_aesthetic: initialData?.style_aesthetic || '',
        description: initialData?.description || '',
        base_price_range: initialData?.base_price_range || '',
        complexity_level: initialData?.complexity_level || 'Medium',
        designer_skill_level: initialData?.designer_skill_level || 'intermediate',
        default_fabric: initialData?.default_fabric || '',
        admin_notes: initialData?.admin_notes || '',
        is_active: initialData?.is_active || false
    });

    // Update form if initialData changes (e.g. after fetch)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                // Ensure defaults if missing in fetch
                complexity_level: initialData.complexity_level || 'Medium',
                designer_skill_level: initialData.designer_skill_level || 'intermediate',
            }));
            setUploadedImages(initialData.images || []);
        }
    }, [initialData]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                setUploadedImages(prev => [...prev, data.url]);
                toast.success("Image uploaded!");
            }
        } catch (err) {
            console.error(err);
            toast.error('Upload failed');
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const _handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                images: uploadedImages
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={_handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Title</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Category</label>
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        <option value="">Select Category</option>
                        <option value="Dress">Dress</option>
                        <option value="Suit">Suit</option>
                        <option value="Shirt / Top">Shirt / Top</option>
                        <option value="Native Wear">Native Wear</option>
                        <option value="Two-Piece Set">Two-Piece Set</option>
                        <option value="Pants / Jackets">Pants / Jackets</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Style Aesthetic</label>
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.style_aesthetic} onChange={e => setFormData({ ...formData, style_aesthetic: e.target.value })}>
                        <option value="">Select Style</option>
                        <option value="Casual">Casual</option>
                        <option value="Formal / Business">Formal / Business</option>
                        <option value="Traditional">Traditional</option>
                        <option value="Streetwear">Streetwear</option>
                        <option value="Bridal / Wedding">Bridal / Wedding</option>
                        <option value="Evening Wear">Evening Wear</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Base Price Range</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. ₦25,000 - ₦40,000"
                        value={formData.base_price_range} onChange={e => setFormData({ ...formData, base_price_range: e.target.value })} />
                </div>
            </div>

            <div>
                <label className="block text-sm text-slate-600 mb-2">Description</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 h-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Complexity</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.complexity_level} onChange={e => setFormData({ ...formData, complexity_level: e.target.value })}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Required Skill Level</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.designer_skill_level} onChange={e => setFormData({ ...formData, designer_skill_level: e.target.value })}>
                        <option value="basic">Basic</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="master">Master</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-600 mb-2">Default Fabric</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Linen, Wool"
                        value={formData.default_fabric} onChange={e => setFormData({ ...formData, default_fabric: e.target.value })} />
                </div>
            </div>

            {/* Images */}
            <div>
                <label className="block text-sm text-slate-600 mb-4">Design Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, i) => (
                        <div key={i} className="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                            <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors text-slate-400">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs">Upload</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                </div>
            </div>

            {/* Admin Status */}
            <div className="pt-6 border-t border-slate-200">
                <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${formData.is_active ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Publish immediately</span>
                </label>
            </div>

            <div className="flex justify-end pt-4">
                <GlowButton variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Design' : 'Create Design')}
                </GlowButton>
            </div>
        </form>
    );
}
