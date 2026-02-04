
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminApi, CuratedDesign } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import { DesignForm } from '../components/DesignForm'; // Assuming relative import
import { useToast } from '@/components/ui/toast';

export default function EditDesignPage() {
    const router = useRouter();
    const toast = useToast();
    const params = useParams();
    const [design, setDesign] = useState<CuratedDesign | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (params.id) {
                try {
                    const data = await adminApi.getDesign(params.id as string);
                    setDesign(data.design);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        };
        load();
    }, [params.id]);

    const handleSubmit = async (data: any) => {
        try {
            await adminApi.updateDesign(params.id as string, data);
            toast.success("Design updated successfully!");
            router.push('/admin/designs');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update design');
        }
    };

    if (loading) return <div className="text-white p-10 text-center">Loading...</div>;
    if (!design) return <div className="text-white p-10 text-center">Design not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 text-slate-900">
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Designs
            </button>

            <h1 className="text-3xl font-bold mb-8 text-slate-900">Edit Design: {design.title}</h1>

            <DesignForm initialData={design} isEdit onSubmit={handleSubmit} />
        </div>
    );
}
