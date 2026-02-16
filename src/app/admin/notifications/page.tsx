'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/toast';
import { Send, Users, Loader2, CheckCircle } from 'lucide-react';

type BroadcastForm = {
    message: string;
    targetRole: 'all' | 'customer' | 'designer';
};

export default function NotificationsPage() {
    const [sending, setSending] = useState(false);
    const [lastSent, setLastSent] = useState<{ count: number; role: string } | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BroadcastForm>();
    const { success, error: toastError } = useToast();

    const onSubmit = async (data: BroadcastForm) => {
        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to send broadcast');

            const result = await res.json();
            setLastSent({ count: result.count, role: data.targetRole });
            reset();
            success(`Message sent to ${result.count} users successfully.`);
        } catch (error) {
            toastError("Failed to send broadcast message.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">Notification Center</h1>
                    <p className="text-slate-500">Broadcast messages to your user base</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-4">Compose Broadcast</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
                                <select
                                    {...register('targetRole')}
                                    className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                >
                                    <option value="all">All Users</option>
                                    <option value="customer">Customers Only</option>
                                    <option value="designer">Designers Only</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                <textarea
                                    {...register('message', { required: 'Message is required' })}
                                    className="w-full p-4 border border-slate-300 rounded-lg bg-slate-50 min-h-[150px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    placeholder="Type your announcement here..."
                                />
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex justify-center items-center gap-2"
                            >
                                {sending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {sending ? 'Sending...' : 'Send Broadcast'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                        <h3 className="font-bold text-purple-900 mb-2">Best Practices</h3>
                        <ul className="space-y-2 text-sm text-purple-800">
                            <li>• Keep messages concise and clear.</li>
                            <li>• Use for urgent updates, maintenance alerts, or new feature announcements.</li>
                            <li>• Avoid sending too frequently to prevent user fatigue.</li>
                        </ul>
                    </div>

                    {lastSent && (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-start gap-3">
                            <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
                            <div>
                                <h3 className="font-bold text-green-900">Success!</h3>
                                <p className="text-sm text-green-800 mt-1">
                                    Last broadcast sent to <strong>{lastSent.count}</strong> {lastSent.role}s.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
