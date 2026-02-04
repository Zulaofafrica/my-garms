"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    User,
    Maximize2,
    Palette,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    History,
    Package
} from "lucide-react";
import { designerApi, profilesApi, authApi, Order, Profile } from "@/lib/api-client";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { ImageModal } from "@/components/ui/image-modal";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-modal";
import styles from "../../designer.module.css";
import { motion, AnimatePresence } from "framer-motion";

interface OrderDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
    const router = useRouter();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [order, setOrder] = useState<Order | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrderData = async () => {
            try {
                const { id } = await params;
                const me = await authApi.me();
                if (me.user.role !== 'designer') {
                    router.push("/profile");
                    return;
                }

                const ordersData = await designerApi.listOrders();
                const foundOrder = ordersData.orders.find(o => o.id === id);

                if (!foundOrder) {
                    setError("Order not found");
                    return;
                }
                setOrder(foundOrder);

                try {
                    const profileData = await designerApi.getProfile(foundOrder.profileId);
                    setProfile(profileData.profile);
                } catch (pErr) {
                    console.error("Profile fetch error:", pErr);
                }

            } catch (err) {
                console.error("Order load error:", err);
                setError("Failed to load order details");
            } finally {
                setIsLoading(false);
            }
        };

        loadOrderData();
    }, [params, router]);

    const [breakdown, setBreakdown] = useState({
        fabric: 0,
        labor: 0,
        customization: 0,
        delivery: 5000 // Fixed
    });
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [startDate, setStartDate] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [endDate, setEndDate] = useState("");
    const [stage, setStage] = useState("");

    useEffect(() => {
        if (order) {
            setStage(order.productionStage || 'design_approved');
            setStartDate(order.productionStartDate || '');
            setEndDate(order.productionEndDate || '');
        }
    }, [order]);

    // ... (useEffect remains same) ...

    const handleConfirmPayment = async () => {
        if (!order || !order.paymentType) return;

        const confirmed = await confirm({
            title: "Confirm Payment",
            message: "Confirm this payment proof is valid?",
            type: "info",
            confirmText: "Confirm Payment",
            cancelText: "Cancel"
        });
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const status = order.paymentType === 'full' ? 'paid_100' : 'paid_70';
            const data = await designerApi.confirmPayment(order.id, status);
            setOrder(data.order);
            toast.success("Payment confirmed!");
        } catch (err) {
            toast.error("Failed to confirm payment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProduction = async () => {
        if (!order) return;
        setIsSubmitting(true);
        try {
            const data = await designerApi.updateProduction(order.id, {
                stage,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setOrder(data.order);
            toast.success("Production status updated successfully!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update production");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAction = async (action: 'suggest_edit' | 'request_change' | 'set_price') => {
        if (!order) return;

        if (action === 'set_price') {
            const totalPrice = breakdown.fabric + breakdown.labor + breakdown.customization + breakdown.delivery;
            if (totalPrice <= 5000) { // Should be more than just delivery
                toast.warning("Please enter valid costs for fabric/labor.");
                return;
            }
        }

        if (action !== 'set_price' && !comment.trim()) {
            toast.warning("Please provide a comment for your feedback.");
            return;
        }

        setIsSubmitting(true);
        try {
            const totalPrice = breakdown.fabric + breakdown.labor + breakdown.customization + breakdown.delivery;

            const payload: any = {
                action,
                comment: comment || (action === 'set_price' ? `Price Quote: ₦${totalPrice.toLocaleString()} (Includes Delivery)` : "")
            };

            if (action === 'set_price') {
                payload.price = totalPrice;
                payload.priceBreakdown = breakdown;
                if (endDate) payload.estimatedCompletionDate = endDate;
            }

            if (attachmentUrl) {
                payload.attachmentUrl = attachmentUrl;
            }

            const data = await designerApi.submitFeedback(order.id, payload);
            setOrder(data.order);
            setComment("");
            setAttachmentUrl("");
            // Do not reset breakdown so they see what they sent, or maybe reset?

            toast.success("Update submitted successfully!");
        } catch (err) {
            console.error("Feedback error:", err);
            toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className={styles.loadingContainer}><div className={styles.spinner} /></div>;
    }

    if (error || !order) {
        return <div className={styles.pageContainer}><p className={styles.error}>{error || "Order not found"}</p></div>;
    }

    return (
        <div className={styles.pageContainer}>
            <button onClick={() => router.back()} className={styles.backBtn}>
                <ArrowLeft size={18} />
                Back to Dashboard
            </button>

            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Review Request</h1>
                    <p className={styles.muted}>Order ID: {order.id}</p>
                </div>
                <div className={`${styles.statusBadge} ${styles['status_' + order.status]}`}>
                    {order.status.replace('_', ' ')}
                </div>
            </div>

            <div className={styles.detailGrid}>
                <div className={styles.mainContent}>
                    {/* Images Section */}
                    {order.images && order.images.length > 0 && (
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><Maximize2 size={20} /> Inspiration & References</h2>
                            <div className={styles.imageGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {order.images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={styles.imageWrapper}
                                        style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer' }}
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img} alt={`Ref ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <ImageModal
                        src={selectedImage}
                        onClose={() => setSelectedImage(null)}
                    />

                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}><Palette size={20} /> Design Specifications</h2>
                        <div className={styles.measurementGrid}>
                            <div className={styles.measurementItem}>
                                <span className={styles.label}>Style/Vibe</span>
                                <span className={styles.value}>{order.style || order.templateName}</span>
                            </div>
                            <div className={styles.measurementItem}>
                                <span className={styles.label}>Fabric</span>
                                <span className={styles.value}>{order.fabricName}</span>
                            </div>
                            <div className={styles.measurementItem}>
                                <span className={styles.label}>Fabric Source</span>
                                <span className={styles.value}>
                                    {order.fabricSource === 'platform' ? 'MyGarms Fabric' :
                                        order.fabricSource === 'own' ? 'Client Providing' :
                                            order.fabricSource === 'unsure' ? 'Not Sure Yet' : 'Standard'}
                                </span>
                            </div>
                            {order.color && (
                                <div className={styles.measurementItem}>
                                    <span className={styles.label}>Color</span>
                                    <span className={styles.value}>{order.color}</span>
                                </div>
                            )}
                            {order.notes && (
                                <div className={styles.measurementItem} style={{ gridColumn: '1 / -1' }}>
                                    <span className={styles.label}>Customer Notes</span>
                                    <span className={styles.value}>{order.notes}</span>
                                </div>
                            )}
                            <div className={styles.measurementItem}>
                                <span className={styles.label}>Budget Range</span>
                                <span className={styles.value}>
                                    {order.total > 0
                                        ? `~₦${order.total.toLocaleString()}`
                                        : (order.budgetRange
                                            ? order.budgetRange === 'budget' ? 'Economy'
                                                : order.budgetRange === 'standard' ? 'Standard'
                                                    : 'Premium'
                                            : "To Quote")}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}><Maximize2 size={20} /> Measurements</h2>
                        {profile ? (
                            <div className={styles.measurementGrid}>
                                {Object.entries(profile.measurements).map(([key, value]) => (
                                    <div key={key} className={styles.measurementItem}>
                                        <span className={styles.label}>{key.replace('_', ' ')}</span>
                                        <span className={styles.value}>{value} cm</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.muted}>Measurement data not available.</p>
                        )}
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}><History size={20} /> History & Feedback</h2>
                        <div className={styles.feedbackLog}>
                            {order.feedbackLog && order.feedbackLog.length > 0 ? (
                                order.feedbackLog.map((log) => (
                                    <div key={log.id} className={styles.logEntry}>
                                        <div className={styles.logHeader}>
                                            <span className={styles.logUser}>{log.userName}</span>
                                            <span className={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                        <span className={`${styles.logAction} ${styles['action_' + log.action]}`}>
                                            {log.action.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <p className={styles.logComment}>{log.comment}</p>
                                        {log.attachmentUrl && (
                                            <div style={{ marginTop: '0.5rem', width: '100px', height: '100px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img src={log.attachmentUrl} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.muted}>No feedback history yet.</p>
                            )}
                        </div>
                    </section>
                </div>

                <aside className={styles.sidebarActions}>
                    {/* Delivery Information (Visible ONLY after Full Payment) */}
                    {order.paymentStatus === 'paid_100' && (
                        <section className={styles.card} style={{ borderColor: 'var(--green)', background: 'rgba(34, 197, 94, 0.03)' }}>
                            <h2 className={styles.cardTitle} style={{ color: 'var(--green)' }}>
                                <Package size={20} /> Delivery Details
                            </h2>
                            {order.deliveryDetails ? (
                                <div className={styles.feedbackForm}>
                                    <div className={styles.measurementItem}>
                                        <span className={styles.label}>Recipient</span>
                                        <span className={styles.value}>{order.deliveryDetails.fullName}</span>
                                    </div>
                                    <div className={styles.measurementItem}>
                                        <span className={styles.label}>Contact</span>
                                        <span className={styles.value}>{order.deliveryDetails.phone}</span>
                                    </div>
                                    <div className={styles.measurementItem}>
                                        <span className={styles.label}>Address</span>
                                        <span className={styles.value}>{order.deliveryDetails.address}, {order.deliveryDetails.city}</span>
                                    </div>
                                    {order.deliveryDetails.landmark && (
                                        <div className={styles.measurementItem}>
                                            <span className={styles.label}>Landmark</span>
                                            <span className={styles.value}>{order.deliveryDetails.landmark}</span>
                                        </div>
                                    )}
                                    {order.deliveryDetails.instructions && (
                                        <div className={styles.measurementItem}>
                                            <span className={styles.label}>Instructions</span>
                                            <span className={styles.value}>{order.deliveryDetails.instructions}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    <p className={styles.muted}>Delivery details not yet provided.</p>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Payment Verification Card */}
                    {order.paymentStatus && order.paymentStatus.startsWith('verify') && (
                        <section className={styles.card} style={{ borderColor: 'var(--accent)', background: 'rgba(99, 102, 241, 0.03)' }}>
                            <h2 className={styles.cardTitle} style={{ color: 'var(--accent)' }}>Payment Verification</h2>
                            <div className={styles.feedbackForm}>
                                <div className={styles.measurementItem}>
                                    <span className={styles.label}>Type</span>
                                    <span className={styles.value}>{order.paymentType === 'full' ? 'Full (100%)' : 'Partial (70%)'}</span>
                                </div>
                                <div style={{ margin: '1rem 0', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                    {/* In real app, this would be the proof image */}
                                    <a href={order.proofUrl} target="_blank" rel="noreferrer">
                                        <img src={order.proofUrl} alt="Payment Proof" style={{ width: '100%', display: 'block' }} />
                                    </a>
                                </div>
                                <button
                                    className={`${styles.button} ${styles.approveBtn}`}
                                    onClick={handleConfirmPayment}
                                    disabled={isSubmitting}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    <CheckCircle size={18} /> Confirm Payment
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Production Control Card */}
                    {['paid_70', 'paid_100'].includes(order.paymentStatus || '') && (
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><Package size={20} /> Production Status</h2>
                            <div className={styles.feedbackForm}>
                                <div className="space-y-4">
                                    <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                                        <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Current Stage</label>
                                        <select
                                            className={`${styles.input} w-full`}
                                            value={stage}
                                            onChange={(e) => setStage(e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="design_approved">Design Approved</option>
                                            <option value="sewing">Sewing</option>
                                            <option value="finishing">Finishing</option>
                                            <option value="ready_for_delivery">Ready for Delivery</option>
                                            <option value="in_transit">In Transit</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Start Date</label>
                                            <input
                                                type="date"
                                                className={styles.input}
                                                style={{ width: '100%' }}
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Est. Completion</label>
                                            <input
                                                type="date"
                                                className={styles.input}
                                                style={{ width: '100%' }}
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                            'In Transit' stage requires 100% full payment confirmation.
                                        </p>
                                    </div>

                                    <button
                                        className={styles.button}
                                        onClick={handleUpdateProduction}
                                        disabled={isSubmitting}
                                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', marginTop: '0.5rem' }}
                                    >
                                        Update Status & Schedule
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Pricing Card */}
                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}>Set Pricing Breakdown</h2>
                        <div className={styles.feedbackForm}>
                            {order.templateId && !['custom', 'custom-template'].includes(order.templateId) ? (
                                /* Locked View for Curated Designs */
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                                        <div className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            LOCKED
                                        </div>
                                        <p className="text-purple-900 text-xs">
                                            This is a <strong>Curated Design</strong>. The price is fixed.
                                            <br />
                                            <span className="text-purple-900 bg-purple-500/20 px-1 rounded ml-1 font-semibold">20% Commission</span> applies to this order.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                        <span className={styles.label} style={{ marginBottom: 0 }}>Total Earnings (Fixed):</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gray-900 block">
                                                ₦{(order.total || order.price || 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Includes delivery & platform fee
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Estimated Completion</label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        className={`${styles.button} ${styles.approveBtn}`}
                                        onClick={() => {
                                            // Auto-fill breakdown for locked orders (simplified)
                                            // Ideally we'd have this data, but for now we essentially skip logic
                                            setBreakdown({
                                                fabric: 0,
                                                labor: (order.total || 0) - 5000, // Rough estimate minus delivery
                                                customization: 0,
                                                delivery: 5000
                                            });
                                            handleAction('set_price');
                                        }}
                                        disabled={isSubmitting || !endDate}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Confirm & Start Order
                                    </button>
                                </div>
                            ) : (
                                /* Standard View - Editable */
                                <>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Fabric Cost (₦)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            placeholder="0"
                                            value={breakdown.fabric}
                                            onChange={(e) => setBreakdown({ ...breakdown, fabric: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Labor Cost (₦)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            placeholder="0"
                                            value={breakdown.labor}
                                            onChange={(e) => setBreakdown({ ...breakdown, labor: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Customization (₦)</label>
                                        <input
                                            type="number"
                                            className={styles.input}
                                            placeholder="0"
                                            value={breakdown.customization}
                                            onChange={(e) => setBreakdown({ ...breakdown, customization: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Delivery Fee (Fixed)</label>
                                        <input
                                            type="text"
                                            className={`${styles.input} bg-slate-900 text-slate-400`}
                                            value="₦5,000"
                                            disabled
                                        />
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4 flex justify-between items-center">
                                        <span className={styles.label} style={{ marginBottom: 0 }}>Total Price:</span>
                                        <span className="text-xl font-bold text-gray-900">
                                            ₦{(breakdown.fabric + breakdown.labor + breakdown.customization + breakdown.delivery).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.label}>Estimated Completion</label>
                                        <input
                                            type="date"
                                            className={styles.input}
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className={`${styles.button} ${styles.approveBtn}`}
                                        onClick={() => handleAction('set_price')}
                                        disabled={isSubmitting || !endDate}
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        Submit Quote
                                    </button>
                                    {order.price && (
                                        <p className={styles.muted} style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                            Current Price: ₦{order.price.toLocaleString()}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    <section className={styles.card}>
                        <h2 className={styles.cardTitle}><MessageSquare size={20} /> Design Feedback</h2>
                        <div className={styles.feedbackForm}>
                            <textarea
                                className={styles.textarea}
                                placeholder="Suggest edits or request changes..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={isSubmitting}
                            />

                            <div className={styles.inputGroup}>
                                <SimpleImageUpload
                                    label="Attach Reference Image (Optional)"
                                    onUpload={(url: string) => setAttachmentUrl(url)}
                                    value={attachmentUrl}
                                />
                            </div>

                            <div className={styles.actions} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    className={`${styles.button} ${styles.suggestBtn}`}
                                    onClick={() => handleAction('suggest_edit')}
                                    disabled={isSubmitting}
                                    style={{ width: '100%' }}
                                >
                                    <MessageSquare size={18} /> Suggest Edits
                                </button>

                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
