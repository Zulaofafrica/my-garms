"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    FileText,
    Palette,
    Banknote,
    CheckCircle,
    Clock,
    AlertCircle,
    MessageSquare,
    Image as ImageIcon,
    Package,
    Star
} from "lucide-react";
import { ordersApi, Order } from "@/lib/api-client";
import { GlowButton } from "@/components/ui/glow-button";
import { SimpleImageUpload } from "@/components/ui/simple-image-upload";
import { DeliveryDetailsForm } from "@/components/delivery-details-form";
import { useToast } from "@/components/ui/toast";

interface CustomerOrderDetailPageProps {
    params: Promise<{ id: string }>;
}

import { ChatInterface } from "@/components/feedback/ChatInterface";
import { authApi } from "@/lib/api-client";

export default function CustomerOrderDetailPage({ params }: CustomerOrderDetailPageProps) {
    const router = useRouter();
    const toast = useToast();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Payment State
    const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
    const [proofUrl, setProofUrl] = useState("");
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [isEditingDelivery, setIsEditingDelivery] = useState(false);

    // Reply State
    const [replyComment, setReplyComment] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<{ bankName: string; accountNumber: string; accountName: string } | null>(null);

    // Rating State
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);

    const handleSendReply = async () => {
        if (!order || !replyComment.trim()) return;

        setIsSendingReply(true);
        try {
            const data = await ordersApi.submitReply(order.id, { comment: replyComment });
            setOrder(data.order);
            setReplyComment("");
        } catch (err) {
            console.error("Reply error:", err);
            toast.error("Failed to send reply");
        } finally {
            setIsSendingReply(false);
        }
    };

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const { id } = await params;
                // Use the single order fetch endpoint for better performance and fresh data
                const { order: foundOrder } = await ordersApi.get(id);
                setOrder(foundOrder);

                try {
                    const me = await authApi.me();
                    setCurrentUser(me.user);
                } catch (e) {
                    console.error("Failed to load user", e);
                }
            } catch (err) {
                console.error("Order load error:", err);
                setError("Failed to load order details");
            } finally {
                setIsLoading(false);
            }
        };

        loadOrder();
    }, [params]);

    // Separate effect to load payment details when status allows
    useEffect(() => {
        if (order && (order.status === 'confirmed' || order.status === 'sewing' || order.status === 'shipping') && !paymentDetails) {
            ordersApi.getPaymentDetails(order.id)
                .then(details => setPaymentDetails(details))
                .catch(err => console.error("Failed to load payment details", err));
        }
    }, [order?.status, order?.id, paymentDetails]); // Include paymentDetails to avoid loop if it stays null on error, but simple check is okay


    const handleApprove = async () => {
        if (!order) return;

        setIsApproving(true);
        try {
            const data = await ordersApi.approve(order.id);
            setOrder(data.order);
            toast.success("Design approved! Please proceed to payment.");
        } catch (err) {
            console.error("Approval error:", err);
            toast.error("Failed to approve order.");
        } finally {
            setIsApproving(false);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!order || !proofUrl) return;

        setIsSubmittingPayment(true);
        try {
            // In a real app, proofUrl comes from file upload
            const data = await ordersApi.submitPayment(order.id, {
                paymentType,
                proofUrl
            });
            setOrder(data.order);
            toast.success("Payment proof submitted! We will verify shortly.");
        } catch (err) {
            console.error("Payment error:", err);
            toast.error("Failed to submit payment.");
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handleRateDesigner = async () => {
        if (!order || rating === 0) return;
        setIsSubmittingRating(true);
        try {
            const data = await ordersApi.submitRating(order.id, { rating, review });
            setOrder(data.order);
            toast.success("Thank you for your feedback!");
        } catch (err) {
            console.error("Rating error:", err);
            toast.error("Failed to submit rating.");
        } finally {
            setIsSubmittingRating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 md:w-16 md:h-16 border-4 border-indigo-500 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-slate-950 pt-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">{error || "Order Not Found"}</h1>
                    <button onClick={() => router.back()} className="text-muted-foreground hover:text-white">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Status Header */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-1">
                                        {order.templateName || "Custom Request"}
                                    </h1>
                                    <p className="text-muted-foreground font-mono text-sm">
                                        ID: {order.id}
                                    </p>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                                    ${order.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                        order.status === 'changes_requested' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'}`}>
                                    {order.status === 'confirmed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    <span className="uppercase tracking-wide">{order.status.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        {order.images && order.images.length > 0 && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" /> Inspiration Images
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {order.images.map((img, i) => (
                                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-800 border border-white/5">
                                            <img src={img} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Request Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Fabric</p>
                                    <p className="text-white font-medium">{order.fabricName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Style/Vibe</p>
                                    <p className="text-white font-medium">{order.style || order.templateName}</p>
                                </div>
                                {order.color && (
                                    <div>
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Color Preference</p>
                                        <p className="text-white font-medium">{order.color}</p>
                                    </div>
                                )}
                                {order.notes && (
                                    <div className="sm:col-span-2">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Additional Notes</p>
                                        <p className="text-white/80">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feedback History */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Designer Feedback
                            </h2>
                            <ChatInterface
                                currentUserId={currentUser?.id || ''}
                                feedbackLog={order.feedbackLog || []}
                                isSending={isSendingReply}
                                onSendMessage={async (msg, attachment) => {
                                    setReplyComment(msg);
                                    // We need to handle state update. 
                                    // The ChatInterface handles clearing its own input, but we need to actually send the data.
                                    // And also support attachment if we add support for it in submitReply API.
                                    // For now, let's just send the comment.

                                    if (!order) return;
                                    setIsSendingReply(true);
                                    try {
                                        const data = await ordersApi.submitReply(order.id, { comment: msg, attachmentUrl: attachment });
                                        setOrder(data.order);
                                        setReplyComment("");
                                    } catch (err) {
                                        console.error("Reply error:", err);
                                        toast.error("Failed to send reply");
                                    } finally {
                                        setIsSendingReply(false);
                                    }
                                }}
                                title="Designer Feedback & Chat"
                                placeholder="Type a reply..."
                            />
                        </div>
                    </div>

                    {/* Sidebar - Pricing, Payment & Action */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-4 text-indigo-300">
                                <Banknote className="w-5 h-5" />
                                <h2 className="font-semibold">Estimated Price</h2>
                            </div>

                            <div className="mb-6">
                                {order.price ? (
                                    <>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-lg text-indigo-300">₦</span>
                                            <span className="text-4xl font-bold text-white">{order.price.toLocaleString()}</span>
                                        </div>

                                        {/* Breakdown Display */}
                                        {order.priceBreakdown && (
                                            <div className="bg-white/5 rounded-lg p-3 space-y-2 mb-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Fabric</span>
                                                    <span className="text-white">₦{order.priceBreakdown.fabric.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Labor</span>
                                                    <span className="text-white">₦{order.priceBreakdown.labor.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Customization</span>
                                                    <span className="text-white">₦{order.priceBreakdown.customization.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                                                    <span className="text-indigo-300">Delivery Fee</span>
                                                    <span className="text-indigo-300">₦{order.priceBreakdown.delivery.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="bg-white/5 rounded-lg p-3 text-center animate-pulse">
                                        <span className="text-xl font-bold text-white/50">Calculating...</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Base Design</span>
                                    <span className="text-white">Included</span>
                                </div>
                                {!order.priceBreakdown && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Fabric</span>
                                        <span className="text-white">Included</span>
                                    </div>
                                )}
                                {order.estimatedCompletionDate && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Est. Delivery</span>
                                        <span className="text-accent font-medium">
                                            {new Date(order.estimatedCompletionDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 pt-3 flex justify-between font-bold">
                                    <span className="text-white">Total</span>
                                    <span className="text-white">
                                        {order.price ? `₦${order.price.toLocaleString()}` : '---'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions / Status */}
                            <div className="mt-8">
                                {!order.status || order.status === 'pending' || order.status === 'reviewing' || order.status === 'changes_requested' ? (
                                    <GlowButton
                                        onClick={handleApprove}
                                        disabled={!order.price || isApproving}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {isApproving ? "Processing..." : order.price ? "Approve Design & Price" : "Waiting for Quote"}
                                    </GlowButton>
                                ) : null}

                                {(order.status === 'confirmed' || order.status === 'sewing' || order.status === 'shipping') && (
                                    <div className="space-y-4">
                                        {/* Payment Status Logic */}
                                        {!order.paymentStatus || order.paymentStatus === 'pending' ? (
                                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                                <h3 className="text-yellow-400 font-bold flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> Payment Required
                                                </h3>
                                                <p className="text-sm text-yellow-200/80 mb-4">Please complete payment to start production.</p>

                                                <div className="space-y-3">
                                                    <button
                                                        className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${paymentType === 'full' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                                                        onClick={() => setPaymentType('full')}
                                                    >
                                                        <div className="font-bold">Full Payment (100%)</div>
                                                        <div className="text-xs opacity-70">₦{order.price?.toLocaleString()}</div>
                                                    </button>
                                                    <button
                                                        className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${paymentType === 'partial' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
                                                        onClick={() => setPaymentType('partial')}
                                                    >
                                                        <div className="font-bold">Partial Payment (70%)</div>
                                                        <div className="text-xs opacity-70">₦{order.price ? (order.price * 0.7).toLocaleString() : 0}</div>
                                                    </button>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="mt-4">
                                                        {(!order.deliveryDetails || isEditingDelivery) ? (
                                                            <div className="relative">
                                                                {isEditingDelivery && (
                                                                    <button
                                                                        onClick={() => setIsEditingDelivery(false)}
                                                                        className="absolute right-0 top-0 text-xs text-muted-foreground hover:text-white"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                                <DeliveryDetailsForm
                                                                    orderId={order.id}
                                                                    onSuccess={(details: any) => {
                                                                        setOrder((prev: any) => prev ? { ...prev, deliveryDetails: details } : null);
                                                                        setIsEditingDelivery(false);
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* Show Delivery Summary if saved */}
                                                                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-4 relative">
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Delivering To:</h4>
                                                                        {!order.productionStage || order.productionStage === 'design_approved' ? (
                                                                            <button
                                                                                onClick={() => setIsEditingDelivery(true)}
                                                                                className="text-xs text-indigo-400 hover:text-indigo-300"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                    <p className="text-sm text-white font-medium">{order.deliveryDetails.fullName}</p>
                                                                    <p className="text-xs text-slate-300">{order.deliveryDetails.address}, {order.deliveryDetails.city}</p>
                                                                    <p className="text-xs text-slate-400 mt-1">{order.deliveryDetails.phone}</p>
                                                                </div>

                                                                <SimpleImageUpload
                                                                    label="Upload Proof of Payment (Screenshot)"
                                                                    onUpload={(url) => setProofUrl(url)}
                                                                    value={proofUrl}
                                                                />
                                                                <div className="bg-slate-900 p-3 rounded text-xs text-muted-foreground my-3">
                                                                    <p className="font-bold text-white mb-1">Bank Details:</p>
                                                                    {paymentDetails ? (
                                                                        <>
                                                                            <p>Bank: {paymentDetails.bankName}</p>
                                                                            <p>Acct: {paymentDetails.accountNumber}</p>
                                                                            <p>Name: {paymentDetails.accountName}</p>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-yellow-500">Loading bank details...</p>
                                                                    )}
                                                                </div>
                                                                <GlowButton
                                                                    className="w-full"
                                                                    variant="primary"
                                                                    disabled={!proofUrl || !paymentType || isSubmittingPayment}
                                                                    onClick={handlePaymentSubmit}
                                                                >
                                                                    {isSubmittingPayment ? "Submitting..." : "Submit Payment"}
                                                                </GlowButton>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : order.paymentStatus.startsWith('verify') ? (
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                                                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                                <p className="text-blue-400 font-bold">Verifying Payment</p>
                                                <p className="text-blue-300/70 text-sm">We are checking your proof of payment.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                                                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                                    <p className="text-green-400 font-bold">Payment Confirmed</p>
                                                    <p className="text-green-400/80 text-sm">Amount Paid: {order.paymentStatus === 'paid_100' ? '100%' : '70%'}</p>
                                                </div>

                                                {/* Production Tracker */}
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-white font-bold flex items-center gap-2">
                                                            <Package className="w-4 h-4" /> Production Status
                                                        </h3>
                                                        {(order.productionStartDate || order.productionEndDate) && (
                                                            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">
                                                                Schedule: {order.productionStartDate ? new Date(order.productionStartDate).toLocaleDateString() : ''}
                                                                {order.productionStartDate && order.productionEndDate ? ' - ' : ''}
                                                                {order.productionEndDate ? new Date(order.productionEndDate).toLocaleDateString() : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4 relative">
                                                        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/10" />
                                                        {[
                                                            { id: 'design_approved', label: 'Design Approved' },
                                                            { id: 'sewing', label: 'Sewing' },
                                                            { id: 'finishing', label: 'Finishing' },
                                                            { id: 'ready_for_delivery', label: 'Ready for Delivery' },
                                                            { id: 'in_transit', label: 'In Transit' },
                                                            { id: 'delivered', label: 'Delivered' }
                                                        ].map((stage, idx) => {
                                                            const stages = ['design_approved', 'sewing', 'finishing', 'ready_for_delivery', 'in_transit', 'delivered'];
                                                            const currentStageIdx = stages.indexOf(order.productionStage || 'design_approved');
                                                            const isCompleted = idx <= currentStageIdx;
                                                            return (
                                                                <div key={stage.id} className="flex gap-3 relative z-10">
                                                                    <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-900 border-white/20'}`} />
                                                                    <span className={`text-sm ${isCompleted ? 'text-white font-medium' : 'text-muted-foreground'}`}>{stage.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Balance Payment Prompt */}
                                                    {order.productionStage === 'ready_for_delivery' && order.paymentStatus !== 'paid_100' && (
                                                        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
                                                            <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                                                                <AlertCircle className="w-4 h-4" /> Ready for Delivery!
                                                            </h4>
                                                            <p className="text-sm text-yellow-200/80 mb-4">
                                                                Your outfit is ready! Please pay the remaining balance to start delivery.
                                                            </p>
                                                            <SimpleImageUpload
                                                                label="Upload Final Payment Proof"
                                                                onUpload={(url) => {
                                                                    // We reuse the payment submit logic but set type to 'full' implicitely
                                                                    setPaymentType('full');
                                                                    setProofUrl(url);
                                                                    toast.info("Proof uploaded! Use the button below to submit.");
                                                                }}
                                                                value={proofUrl}
                                                            />
                                                            <div className="mt-3">
                                                                <GlowButton
                                                                    className="w-full"
                                                                    variant="primary"
                                                                    onClick={handlePaymentSubmit}
                                                                    disabled={!proofUrl || isSubmittingPayment}
                                                                >
                                                                    Submit Final Payment
                                                                </GlowButton>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rating Section */}
                                {order.status === 'delivered' && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        {order.rating ? (
                                            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-center">
                                                <h3 className="text-white font-bold mb-2">You Rated This Designer</h3>
                                                <div className="flex justify-center gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-5 h-5 ${star <= (order.rating || 0) ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-sm text-slate-300 italic">"{order.review}"</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                                    <Star className="w-5 h-5 text-amber-400" /> Rate Your Experience
                                                </h3>
                                                <div className="flex justify-center gap-2 mb-4">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            className="focus:outline-none transition-transform hover:scale-110"
                                                        >
                                                            <Star
                                                                className={`w-8 h-8 ${star <= rating ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 text-sm mb-4"
                                                    placeholder="Write a review (optional)..."
                                                    rows={3}
                                                    value={review}
                                                    onChange={(e) => setReview(e.target.value)}
                                                />
                                                <GlowButton
                                                    onClick={handleRateDesigner}
                                                    disabled={rating === 0 || isSubmittingRating}
                                                    className="w-full"
                                                >
                                                    {isSubmittingRating ? "Submitting..." : "Submit Review"}
                                                </GlowButton>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Dispute / Report Issue */}
                                {(order.status === 'confirmed' || order.status === 'sewing' || order.status === 'shipping' || order.status === 'delivered') && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => router.push(`/dashboard/${order.id}/dispute`)}
                                            className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors py-2"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            Report an Issue
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
