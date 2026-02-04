
"use client";

import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import { DesignForm } from '../components/DesignForm';
import { useToast } from '@/components/ui/toast';

export default function NewDesignPage() {
    const router = useRouter();
    const toast = useToast();

    const handleSubmit = async (data: any) => {
        try {
            await adminApi.createDesign(data);
            toast.success("Design created successfully!");
            router.push('/admin/designs');
        } catch (error) {
            toast.error('Failed to create design');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 text-slate-900">
            <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Designs
            </button>

            <h1 className="text-3xl font-bold mb-8 text-slate-900">Create New Curated Design</h1>

            <DesignForm onSubmit={handleSubmit} />
        </div>
    );
}
