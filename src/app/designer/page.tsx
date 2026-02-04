"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    Clock,
    ChevronRight,
    Search,
    Briefcase,
    Wallet,
    ArrowRight,
    X,
    CreditCard,
    AlertTriangle,
    Star
} from "lucide-react";
import { designerApi, authApi, Order, User } from "@/lib/api-client";
import styles from "./designer.module.css";
import Link from "next/link";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { useToast } from "@/components/ui/toast";

function DisputesList() {
    const [disputes, setDisputes] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/designer/disputes').then(r => r.json()).then(data => {
            if (data.success) setDisputes(data.disputes);
        });
    }, []);

    if (disputes.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {disputes.map((dispute: any) => (
                <Link key={dispute.id} href={`/designer/disputes/${dispute.id}`} className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded uppercase">{dispute.status}</span>
                        <span className="text-xs text-slate-500">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-gray-900 font-bold mb-1">{dispute.category}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">{dispute.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 pt-2 border-t border-red-200">
                        <AlertCircle size={14} /> Only {dispute.orderId.slice(0, 8)}...
                    </div>
                </Link>
            ))}
        </div>
    );
}

export default function DesignerDashboard() {
    const router = useRouter();
    const toast = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [designerProfile, setDesignerProfile] = useState<any>(null);

    // Finance State
    const [financeStats, setFinanceStats] = useState({ accrued: 0, paid: 0, pending: 0, balance: 0 });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        type: 'full' as 'full' | 'partial',
        amount: '',
        proofUrl: '',
        notes: ''
    });

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showPaymentModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showPaymentModal]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Check auth and role
                const me = await authApi.me();
                if (me.user.role !== 'designer') {
                    router.push("/profile");
                    return;
                }
                setUser(me.user);

                // Load Profile Data (Photo)
                try {
                    const settings = await designerApi.getSettings();
                    if (settings.profile) {
                        setDesignerProfile(settings.profile);
                        if (settings.profile.profilePhoto) {
                            setProfilePhoto(settings.profile.profilePhoto);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load profile photo", e);
                }

                // Load orders
                const data = await designerApi.listOrders();
                setOrders(data.orders);

                // Load Finance Stats
                const finance = await fetch('/api/designer/finance').then(res => res.json());
                if (!finance.error) {
                    setFinanceStats(finance);
                }
            } catch (err: any) {
                // Only log real errors, not expected auth failures
                if (err.message !== 'Not authenticated') {
                    console.error("Dashboard load error:", err);
                }
                router.push("/auth/login");
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboard();
    }, [router]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.fabricName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        reviewing: orders.filter(o => o.status === 'reviewing').length,
        changes: orders.filter(o => o.status === 'changes_requested').length,
        total: orders.length,
        revenue: orders.reduce((sum, o) => {
            if (!o.price) return sum;
            if (['confirmed', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'].includes(o.status)) {
                return sum + o.price;
            }
            return sum;
        }, 0)
    };

    const handleOpenPayment = () => {
        setPaymentForm({
            type: 'full',
            amount: Math.round(financeStats.balance).toString(),
            proofUrl: '',
            notes: ''
        });
        setShowPaymentModal(true);
    };

    const handleSubmitPayment = async () => {
        const amount = Number(paymentForm.amount);
        if (!amount || amount <= 0) {
            toast.warning("Please enter a valid amount");
            return;
        }
        if (!paymentForm.proofUrl) {
            toast.warning("Please upload proof of payment");
            return;
        }

        setIsPaying(true);
        try {
            const res = await fetch('/api/designer/commission/pay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    proofUrl: paymentForm.proofUrl,
                    notes: paymentForm.notes
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Payment failed');

            toast.success("Payment submitted successfully! Waiting for admin approval.");
            setShowPaymentModal(false);

            // Refresh stats
            const finance = await fetch('/api/designer/finance').then(res => res.json());
            if (!finance.error) {
                setFinanceStats(finance);
            }
        } catch (err) {
            console.error("Payment error", err);
            toast.error("Failed to submit payment.");
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Designer Portal</h1>
                    <p className={styles.subtitle}>Manage and review custom design requests.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/designer/settings" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-slate-600 hover:text-gray-900 transition-colors" title="Settings">
                        <Briefcase size={20} />
                    </Link>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center ring-2 ring-indigo-500/50">
                                <span className="text-lg font-bold text-indigo-600">{user?.firstName?.[0]}</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-bold leading-tight">{user?.firstName} {user?.lastName}</span>
                            <span className="text-xs text-slate-500 font-medium">Master Designer</span>
                            {designerProfile && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                                    <span className="text-xs font-bold text-gray-900">{Number(designerProfile.rating || 0).toFixed(1)}</span>
                                    <span className="text-[10px] text-slate-500">({designerProfile.reviewCount || 0})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="mb-8 p-6 rounded-xl bg-indigo-900 border border-indigo-500/20 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">New Design Matches Available!</h3>
                    <p className="text-indigo-200">There are new customer requests waiting for your review.</p>
                </div>
                <Link
                    href="/designer/requests"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                >
                    <ClipboardList size={20} />
                    View New Requests
                </Link>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-emerald-900 border border-emerald-500/20 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-emerald-400 font-bold flex items-center gap-2">
                                <span className="font-sans text-xl">₦</span> Total Revenue
                            </h3>
                            <p className="text-emerald-200/60 text-sm">Total value of active/completed orders</p>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Wallet size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">₦{stats.revenue.toLocaleString()}</p>
                </div>

                <div className="bg-orange-900 border border-orange-500/20 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-orange-400 font-bold flex items-center gap-2">
                                <AlertCircle size={20} /> Commission Due
                            </h3>
                            <p className="text-orange-200/60 text-sm">15% platform commission (Ledger Balance)</p>
                        </div>
                        <button
                            onClick={handleOpenPayment}
                            disabled={financeStats.balance <= 100 || isPaying} // Threshold to avoid paying pennies
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            {isPaying ? 'Processing...' : 'Pay Commission'}
                            {!isPaying && <ArrowRight size={16} />}
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-white">₦{Math.floor(financeStats.balance).toLocaleString()}</p>
                            {financeStats.pending > 0 && <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">₦{Math.floor(financeStats.pending).toLocaleString()} Pending Approval</span>}
                        </div>
                        <p className="text-xs text-orange-200/40">Total Accrued: ₦{Math.floor(financeStats.accrued).toLocaleString()} • Paid: ₦{Math.floor(financeStats.paid).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.pending}</span>
                    <span className={styles.statLabel}>Pending Assignment</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.reviewing}</span>
                    <span className={styles.statLabel}>In Review</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.changes}</span>
                    <span className={styles.statLabel}>Changes Requested</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.total}</span>
                    <span className={styles.statLabel}>My Active Orders</span>
                </div>
            </div>

            {/* Active Disputes Section - NEW */}
            <section className={styles.ordersSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={`${styles.sectionTitle} text-red-400 flex items-center gap-2`}>
                        <AlertTriangle className="w-5 h-5" />
                        Active Disputes
                    </h2>
                </div>

                <DisputesList />
            </section>

            <section className={styles.ordersSection}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Active Requests</h2>
                    <div className={styles.searchWrapper}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by ID or template..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.orderList}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/designer/orders/${order.id}`}
                                className={styles.orderItem}
                            >
                                <div className={styles.orderIcon}>
                                    <ClipboardList size={24} />
                                </div>
                                <div className={styles.orderInfo}>
                                    <span className={styles.orderId}>{order.id}</span>
                                    <h3 className={styles.orderTitle}>{order.templateName}</h3>
                                    <span className={styles.orderMeta}>
                                        Fabric: {order.fabricName} • {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className={styles.orderStatus}>
                                    <span className={`${styles.statusBadge} ${styles['status_' + order.status]}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <ChevronRight size={20} className={styles.chevron} />
                            </Link>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No requests found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </section>
            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl scale-in-95 animate-in duration-200 max-h-[90vh] overflow-y-auto my-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="text-orange-500" /> Pay Commission
                            </h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Bank Details */}
                            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
                                <p className="text-xs font-bold text-indigo-400 uppercase mb-2 tracking-wider">Pay to MyGarms Account</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-300 flex justify-between">Bank: <span className="text-white font-medium">GTBank</span></p>
                                    <p className="text-sm text-slate-300 flex justify-between">Account Number: <span className="text-white font-mono text-lg font-bold">0123456789</span></p>
                                    <p className="text-sm text-slate-300 flex justify-between">Account Name: <span className="text-white font-medium">MyGarms Limited</span></p>
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div className="flex bg-white/5 rounded-lg p-1">
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentForm.type === 'full' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setPaymentForm(prev => ({ ...prev, type: 'full', amount: Math.round(financeStats.balance).toString() }))}
                                >
                                    Full Payment incl. Pending (₦{Math.round(financeStats.balance).toLocaleString()})
                                </button>
                                <button
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${paymentForm.type === 'partial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    onClick={() => setPaymentForm(prev => ({ ...prev, type: 'partial', amount: '' }))}
                                >
                                    Partial Payment
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Amount to Pay (<span className="font-sans">₦</span>)</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                                    disabled={paymentForm.type === 'full'}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 font-mono text-lg"
                                    placeholder="Enter amount..."
                                />
                            </div>

                            {/* Proof Upload */}
                            <div>
                                <SimpleImageUpload
                                    label="Upload Proof of Payment"
                                    value={paymentForm.proofUrl}
                                    onUpload={(url) => setPaymentForm(prev => ({ ...prev, proofUrl: url }))}
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-2">
                                <button
                                    onClick={handleSubmitPayment}
                                    disabled={!paymentForm.amount || !paymentForm.proofUrl || isPaying}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {isPaying ? 'Processing...' : 'Submit Payment for Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
