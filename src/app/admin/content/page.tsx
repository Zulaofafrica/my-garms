'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/toast';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';

type Fabric = {
    id: string;
    name: string;
    type: string;
    price: number;
    color: string;
    inStock: boolean;
};

type Template = {
    id: string;
    name: string;
    category: string;
    basePrice: number;
};

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState<'fabrics' | 'templates'>('fabrics');
    const [fabrics, setFabrics] = useState<Fabric[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const { success, error: toastError } = useToast();

    // Forms
    const { register: registerFabric, handleSubmit: handleFabricSubmit, reset: resetFabric } = useForm();
    const { register: registerTemplate, handleSubmit: handleTemplateSubmit, reset: resetTemplate } = useForm();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const [fRes, tRes] = await Promise.all([
                fetch('/api/admin/content/fabrics'),
                fetch('/api/admin/content/templates')
            ]);

            if (fRes.ok) setFabrics(await fRes.json());
            if (tRes.ok) setTemplates(await tRes.json());
        } catch (err) {
            console.error(err);
            toastError('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const onAddFabric = async (data: any) => {
        try {
            const res = await fetch('/api/admin/content/fabrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed');
            success('Fabric added');
            resetFabric();
            fetchContent();
        } catch (err) {
            toastError('Failed to add fabric');
        }
    };

    const onAddTemplate = async (data: any) => {
        try {
            const res = await fetch('/api/admin/content/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed');
            success('Template added');
            resetTemplate();
            fetchContent();
        } catch (err) {
            toastError('Failed to add template');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold font-heading text-primary">Content Management</h1>

            <div className="flex space-x-4 border-b">
                <button
                    className={`pb-2 px-4 ${activeTab === 'fabrics' ? 'border-b-2 border-primary font-bold' : ''}`}
                    onClick={() => setActiveTab('fabrics')}
                >
                    Fabrics
                </button>
                <button
                    className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-primary font-bold' : ''}`}
                    onClick={() => setActiveTab('templates')}
                >
                    Templates
                </button>
            </div>

            {activeTab === 'fabrics' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-bold mb-4">Add New Fabric</h3>
                        <form onSubmit={handleFabricSubmit(onAddFabric)} className="grid grid-cols-2 gap-4">
                            <input {...registerFabric('name', { required: true })} placeholder="Fabric Name" className="p-2 border rounded" />
                            <input {...registerFabric('type')} placeholder="Type (e.g. Cotton)" className="p-2 border rounded" />
                            <input {...registerFabric('color')} placeholder="Color" className="p-2 border rounded" />
                            <input {...registerFabric('price', { required: true })} type="number" placeholder="Price per yard" className="p-2 border rounded" />
                            <input {...registerFabric('image')} placeholder="Image URL" className="p-2 border rounded col-span-2" />
                            <textarea {...registerFabric('description')} placeholder="Description" className="p-2 border rounded col-span-2" />
                            <button type="submit" className="bg-primary text-white p-2 rounded col-span-2 flex justify-center items-center gap-2">
                                <Plus size={16} /> Add Fabric
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {fabrics.map((fabric) => (
                            <div key={fabric.id} className="p-4 border rounded-lg bg-card flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">{fabric.name}</h4>
                                    <p className="text-sm text-gray-500">{fabric.type} - {fabric.color}</p>
                                    <p className="font-mono mt-1">₦{Number(fabric.price).toLocaleString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${fabric.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {fabric.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-bold mb-4">Add New Template</h3>
                        <form onSubmit={handleTemplateSubmit(onAddTemplate)} className="grid grid-cols-2 gap-4">
                            <input {...registerTemplate('name', { required: true })} placeholder="Template Name" className="p-2 border rounded" />
                            <input {...registerTemplate('category', { required: true })} placeholder="Category" className="p-2 border rounded" />
                            <input {...registerTemplate('basePrice')} type="number" placeholder="Base Price" className="p-2 border rounded" />
                            <input {...registerTemplate('image')} placeholder="Image URL" className="p-2 border rounded" />
                            <textarea {...registerTemplate('description')} placeholder="Description" className="p-2 border rounded col-span-2" />
                            <button type="submit" className="bg-primary text-white p-2 rounded col-span-2 flex justify-center items-center gap-2">
                                <Plus size={16} /> Add Template
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map((tmpl) => (
                            <div key={tmpl.id} className="p-4 border rounded-lg bg-card">
                                <h4 className="font-bold">{tmpl.name}</h4>
                                <p className="text-sm text-gray-500">{tmpl.category}</p>
                                <p className="font-mono mt-1">Base: ₦{Number(tmpl.basePrice || 0).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
