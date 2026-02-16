'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/toast';
import { Save, Loader2, DollarSign, Percent, Phone, Mail } from 'lucide-react';

interface SettingsForm {
    delivery_fee: number;
    commission_rate: number;
    support_phone: string;
    support_email: string;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { success, error: toastError } = useToast();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsForm>();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (!res.ok) throw new Error('Failed to load settings');
            const data = await res.json();
            // Ensure numbers are numbers
            reset({
                delivery_fee: Number(data.delivery_fee),
                commission_rate: Number(data.commission_rate),
                support_phone: data.support_phone,
                support_email: data.support_email
            });
        } catch (err) {
            console.error(err);
            toastError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: SettingsForm) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error('Failed to update settings');

            success('Settings updated successfully');
        } catch (err) {
            console.error(err);
            toastError('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage global platform configuration and pricing.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Financial Settings */}
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Financial Configuration
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Delivery Fee (₦)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                                <input
                                    type="number"
                                    {...register('delivery_fee', { required: true, min: 0 })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Flat fee charged to customers for delivery.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Commission Rate (%)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">%</span>
                                <input
                                    type="number"
                                    step="0.1"
                                    {...register('commission_rate', { required: true, min: 0, max: 100 })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Percentage deducted from designer payouts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Support Settings */}
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Support Contact
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support Phone</label>
                            <input
                                {...register('support_phone', { required: true })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Support Email</label>
                            <input
                                type="email"
                                {...register('support_email', { required: true })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
