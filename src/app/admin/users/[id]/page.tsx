
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, ShoppingBag, Ruler, Wallet, Briefcase, Calendar, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-modal';

// Types mirror the API response
interface UserDetailsData {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        createdAt: string;
        address?: string;
        state?: string;
    };
    customerDetails?: {
        profiles: any[];
        orders: any[];
        totalSpent: number;
        orderCount: number;
    };
    designerDetails?: {
        profile: any;
        assignedOrders: any[];
        payments: any[];
        stats: {
            completedOrders: number;
            activeOrders: number;
            totalCommissionEarned: number;
            outstandingBalance: number;
        };
    };
}

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [data, setData] = useState<UserDetailsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/admin/users/${params.id}/details`);
                if (!res.ok) throw new Error('Failed to load');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load user details');
            } finally {
                setIsLoading(false);
            }
        };
        if (params.id) fetchDetails();
    }, [params.id, toast]);

    if (isLoading) return <div className="p-8">Loading details...</div>;
    if (!data) return <div className="p-8">User not found</div>;

    const { user, customerDetails, designerDetails } = data;

    return (
        <div className="max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Users
            </button>

            {/* Header / Identity Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{user.firstName} {user.lastName}</h1>
                        <p className="text-slate-500">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'designer' ? 'bg-pink-100 text-pink-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                {user.role}
                            </span>
                            <span className="text-xs text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                        {(user.address || user.state) && (
                            <div className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                                <span className="font-medium">Location:</span>
                                {user.address}{user.address && user.state ? ', ' : ''}{user.state}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            {user.role === 'customer' && customerDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <ShoppingBag size={16} /> Overview
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Total Spent</p>
                                <p className="text-2xl font-bold text-slate-900">₦{customerDetails.totalSpent.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Orders</p>
                                <p className="text-2xl font-bold text-slate-900">{customerDetails.orderCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Measurements */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Ruler size={16} /> Measurement Profiles
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {customerDetails.profiles.length > 0 ? customerDetails.profiles.map((profile: any) => (
                                <div key={profile.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="font-bold text-slate-800">{profile.name}</h4>
                                    <p className="text-xs text-slate-500 capitalize">{profile.gender}</p>
                                    <div className="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-x-2 gap-y-1">
                                        {Object.entries(profile.measurements).slice(0, 6).map(([key, val]) => (
                                            <div key={key}><span className="font-medium text-slate-400 capitalize">{key}:</span> {val as string}</div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 italic">No profiles created yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-3">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Calendar size={16} /> Recent Order History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Order ID</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Item</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Date</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {customerDetails.orders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">#{order.id.slice(-6)}</td>
                                            <td className="px-4 py-3 font-medium">{order.templateName}</td>
                                            <td className="px-4 py-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-3 capitalize">{order.status.replace('_', ' ')}</td>
                                            <td className="px-4 py-3 font-bold">₦{(order.price || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {customerDetails.orders.length === 0 && (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No orders placed.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Designer Information */}
            {user.role === 'designer' && designerDetails && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Financial Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Wallet size={16} /> Financials
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-green-600">₦{Math.round(designerDetails.stats.outstandingBalance).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Lifetime Earnings</p>
                                <p className="text-2xl font-bold text-slate-900">₦{designerDetails.stats.totalCommissionEarned.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Commission Payments History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-1">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <CreditCard size={16} /> Commission History
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {designerDetails.payments.length > 0 ? (
                                designerDetails.payments.map((payment: any) => (
                                    <div key={payment.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold">₦{payment.amount.toLocaleString()}</span>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{payment.status}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-2">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </div>
                                        {payment.proofUrl && (
                                            <div className="mb-2">
                                                <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    View Receipt ↗
                                                </a>
                                            </div>
                                        )}
                                        {payment.status === 'pending' && (
                                            <button
                                                onClick={async () => {
                                                    const confirmed = await confirm({
                                                        title: "Approve Payment",
                                                        message: "Confirm receipt of this payment?",
                                                        type: "info",
                                                        confirmText: "Approve",
                                                        cancelText: "Cancel"
                                                    });
                                                    if (!confirmed) return;
                                                    try {
                                                        const res = await fetch(`/api/admin/commission/${payment.id}/approve`, { method: 'POST' });
                                                        if (res.ok) {
                                                            toast.success('Payment approved!');
                                                            window.location.reload();
                                                        }
                                                    } catch (e) { toast.error('Failed to approve'); }
                                                }}
                                                className="w-full py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                            >
                                                Approve Payment
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 italic">No payments recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Profile & Skills */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                        <div className="flex justify-between">
                            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                <Briefcase size={16} /> Professional Profile
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${designerDetails.profile?.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {designerDetails.profile?.status || 'Unknown'}
                            </span>
                        </div>

                        {designerDetails.profile ? (
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Skills & Level</p>
                                    <p className="font-medium capitalize mb-2">{designerDetails.profile.skillLevel} Level</p>
                                    <div className="flex flex-wrap gap-1">
                                        {designerDetails.profile.specialties.map((s: string) => (
                                            <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase mb-1">Bank Details</p>
                                    <p className="font-medium text-slate-900">{designerDetails.profile.bankName || 'N/A'}</p>
                                    <p className="text-sm text-slate-600">{designerDetails.profile.accountNumber} - {designerDetails.profile.accountName}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Workshop Address</p>
                                    <p className="text-sm text-slate-800">{designerDetails.profile.workshopAddress || 'Not provided'}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Contact Phone</p>
                                    <p className="text-sm text-slate-800">{designerDetails.profile.phoneNumber || 'Not provided'}</p>
                                </div>
                                <div className="col-span-2 border-t pt-4">
                                    <p className="text-xs text-slate-500 uppercase mb-1">National Identity Number (NIN)</p>
                                    <p className="text-sm font-mono font-medium text-slate-800">{designerDetails.profile.identificationUrl || 'Not provided'}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 py-4">No designer profile setup yet.</p>
                        )}
                    </div>

                    {/* Requests/Jobs History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-3">
                        <h3 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                            <Briefcase size={16} /> Job History
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Order ID</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Fabric/Item</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Status</th>
                                        <th className="px-4 py-3 font-semibold text-slate-500">Value (Commission)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {designerDetails.assignedOrders.map((order: any) => {
                                        const deliveryFee = order.priceBreakdown?.delivery || 5000;
                                        const rate = order.templateId ? 0.20 : 0.15;
                                        const commission = (Math.max(0, (order.price || 0) - deliveryFee) * rate);
                                        return (
                                            <tr key={order.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{order.id.slice(-6)}</td>
                                                <td className="px-4 py-3 font-medium">{order.templateName}</td>
                                                <td className="px-4 py-3 capitalize">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold">
                                                    ₦{(order.price || 0).toLocaleString()}
                                                    <span className="text-xs font-normal text-slate-500 ml-1">
                                                        (₦{Math.round(commission).toLocaleString()})
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {designerDetails.assignedOrders.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No jobs assigned yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
