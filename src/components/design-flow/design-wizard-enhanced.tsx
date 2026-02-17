"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { CategoryStyleForm } from "./CategoryStyleForm";
import { DesignDetailForm } from "./DesignDetailForm";
import { SpecForm } from "./spec-form";
import { authApi, ordersApi, profilesApi } from "@/lib/api-client";
import { GenderSelector } from "@/components/profile/GenderSelector";
import { MaleMeasurementsForm } from "@/components/profile/MaleMeasurementsForm";
import { FemaleMeasurementsForm } from "@/components/profile/FemaleMeasurementsForm";
import { Gender, MaleMeasurements, FemaleMeasurements } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

// Schema for the Design Request
const designSchema = z.object({
    category: z.string().min(1, "Required"),
    style: z.string().min(1, "Required"),

    // Details (Step 3)
    images: z.array(z.any()).min(1, "Please upload at least one image"),
    complexity: z.string().min(1, "Required"),
    notes: z.string().optional(),

    // Logistics (Step 4)
    urgency: z.string().min(1, "Required"),
    fabricSource: z.string().optional(),
    budgetRange: z.string().optional(),

    // Legacy (kept optional just in case)
    fabric: z.string().optional(),
    color: z.string().optional(),
});

type DesignFormData = z.infer<typeof designSchema>;

const STEPS = [
    { id: 1, title: "Vision", description: "Category & Style" },
    { id: 2, title: "Measurements", description: "Your Fit" },
    { id: 3, title: "Details", description: "Visuals & Notes" },
    { id: 4, title: "Logistics", description: "Timeline & Budget" },
    { id: 5, title: "Submit", description: "Create Account" },
];

function WizardContent() {
    const router = useRouter();
    const toast = useToast();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfileId, setUserProfileId] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Guest Flow State
    const [gender, setGender] = useState<Gender>("male");
    const [measurements, setMeasurements] = useState<MaleMeasurements | FemaleMeasurements | any>({});
    const [accountInfo, setAccountInfo] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [templateData, setTemplateData] = useState<any>(null);

    const methods = useForm<DesignFormData>({
        resolver: zodResolver(designSchema),
        defaultValues: {
            images: [],
            fabricSource: 'unsure',
            budgetRange: 'standard'
        },
    });

    // Handle Search Params (Pre-fill)
    useEffect(() => {
        const fetchTemplate = async () => {
            const templateId = searchParams.get('templateId');
            if (templateId) {
                // Fetch template details to pre-fill
                try {
                    // Using public route to get details or pass details via props if we had them
                    // Since we just have ID, we need to fetch.
                    // IMPORTANT: We need a way to get single design publicly.
                    // For now, fetching all and finding.
                    const res = await fetch('/api/curated-designs');
                    const data = await res.json();
                    const template = data.designs.find((d: any) => d.id === templateId);

                    if (template) {
                        setTemplateData(template);
                        methods.setValue('category', template.category);
                        methods.setValue('style', template.title); // Use title as style
                        // methods.setValue('notes', template.description); // Maybe? User might want own notes.
                        methods.setValue('budgetRange', 'standard'); // Default or derived

                        // If we could pre-fill images, we would, but the form expects File objects or strings?
                        // Schema says z.any().
                        if (template.images && template.images.length > 0) {
                            methods.setValue('images', template.images);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load template", e);
                }
            } else {
                // Standard pre-fill
                const category = searchParams.get('category');
                const style = searchParams.get('style');
                if (category) methods.setValue('category', category);
                if (style) methods.setValue('style', style);
            }
        };
        fetchTemplate();
    }, [searchParams, methods]);

    // Initial Auth Check & Template Logic
    useEffect(() => {
        const checkAuth = async () => {
            const templateId = searchParams.get('templateId');

            try {
                const me = await authApi.me();
                if (me.user) {
                    setIsLoggedIn(true);
                    // Fetch existing profile
                    const pData = await profilesApi.list();
                    if (pData.profiles.length > 0) {
                        const profile = pData.profiles[0];
                        setUserProfileId(profile.id);

                        // Template Mode + Logged In Logic
                        if (templateId) {
                            const hasMeasurements = profile.measurements && Object.keys(profile.measurements).length > 0;
                            if (hasMeasurements) {
                                // Skip to Step 3 (Details) if measurements exist
                                setCurrentStep(3);
                            } else {
                                // Go to Step 2 (Measurements) if missing
                                setCurrentStep(2);
                            }
                        } else {
                            // Regular Mode + Logged In: Start at 1, but we might skip 2 later?
                            // Actually, regular flow starts at 1.
                        }
                    } else if (templateId) {
                        // Logged in but no profile (rare), go to measurements (Step 2)
                        setCurrentStep(2);
                    }
                } else if (templateId) {
                    // Guest + Template Mode: Start at Measurements (Step 2)
                    setCurrentStep(2);
                }
            } catch (err) {
                // Not logged in
                if (templateId) {
                    // Guest + Template Mode: Start at Measurements (Step 2)
                    setCurrentStep(2);
                }
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, [searchParams]);

    // ... Rest of the logic (nextStep, etc)

    // Step Logic
    const nextStep = () => {
        let next = currentStep + 1;
        if (isLoggedIn && next === 2) {
            // Normal flow skips measurements if verified? 
            // Actually, if simply logged in, we usually check if they want to edit measurements.
            // But for now keeping existing logic: if logged in, skip 2? 
            // Wait, existing logic was: `if (isLoggedIn && next === 2) next = 3;`
            // This implies logged-in users NEVER see measurements in the wizard? That seems wrong if they need to update them.
            // But I will keep it consistent with the user's previous code, UNLESS they have no measurements.
            // Let's refine: If template mode, we explicitly handled the start step.
            // If we are confirming "Next" from Step 3 -> 4, 4 -> 5 etc.
            // The skip logic needs to be safe.

            // If we are in Template Mode, we already skipped steps.
            // If we are in Regular Mode, existing logic skipped Step 2.
            // I will leave this as is for now to avoid breaking existing flows, assuming "profile" page handles measurement updates.
            next = 3;
        }

        if (isLoggedIn && next === 5) {
            methods.handleSubmit(onSubmit)();
            return;
        }

        setCurrentStep(next);
    };

    const prevStep = () => {
        let prev = currentStep - 1;
        // If Template Mode, prevent going back to Step 1 (Locked Base Structure)
        const templateId = searchParams.get('templateId');
        if (templateId && prev < 2) {
            return; // Block going to Step 1
        }

        if (isLoggedIn && prev === 2) prev = 1;
        setCurrentStep(prev);
    };

    const handleGenderChange = (g: Gender) => {
        setGender(g);
        setMeasurements({});
    };

    const handleAccountChange = (field: string, value: string) => {
        setAccountInfo(prev => ({ ...prev, [field]: value }));
    };

    const onSubmit = async (data: DesignFormData) => {
        setIsSubmitting(true);
        try {
            // Upload Images if they are Files (not strings from template)
            const imageUrls = await Promise.all(data.images.map(async (file: any) => {
                if (typeof file === 'string') return file; // Already a URL

                const formData = new FormData();
                formData.append("file", file);

                try {
                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (res.ok) {
                        const data = await res.json();
                        return data.url;
                    }
                } catch (e) {
                    console.error("Image upload failed", e);
                }
                return null;
            }));

            const validImageUrls = imageUrls.filter(url => url !== null) as string[];
            const templateId = searchParams.get('templateId');

            // Calculate Total for Curated Designs
            let calculatedTotal = 0;
            if (templateId && templateData && templateData.base_price_range) {
                // Try to parse range "25,000 - 30,000"
                const numbers = templateData.base_price_range.match(/(\d[\d,]*)/g);
                if (numbers && numbers.length > 0) {
                    const vals = numbers.map((n: string) => parseInt(n.replace(/,/g, ''), 10));
                    if (vals.length === 2) {
                        calculatedTotal = Math.floor((vals[0] + vals[1]) / 2);
                    } else if (vals.length === 1) {
                        calculatedTotal = vals[0];
                    }
                }
            }

            const orderData = {
                category: data.category,
                complexity: data.complexity,
                urgency: data.urgency,
                templateId: templateId || undefined,
                templateName: templateId ? `Curated: ${data.style}` : `${data.category} - ${data.style}`,
                fabricName: data.fabricSource === 'own' ? 'Client Fabric'
                    : data.fabricSource === 'platform' ? 'MyGarms Fabric'
                        : data.fabricSource === 'unsure' ? 'Not Sure Yet'
                            : (data.fabric || "Custom Fabric"),
                total: calculatedTotal,
                images: validImageUrls,
                style: data.style,
                color: data.color,
                notes: data.notes,
                budgetRange: data.budgetRange,
                fabricSource: data.fabricSource,
            };

            if (isLoggedIn) {
                let targetProfileId = userProfileId;
                if (!targetProfileId) {
                    const pData = await profilesApi.list();
                    if (pData.profiles.length > 0) targetProfileId = pData.profiles[0].id;
                }

                if (!targetProfileId) {
                    toast.error("Profile error. Please check your profile.");
                    return;
                }

                const { order } = await ordersApi.create({
                    profileId: targetProfileId,
                    fabricId: "custom-fabric",
                    ...orderData
                });
                router.push(`/design/selection/${order.id}`);
            } else { // Guest
                if (!accountInfo.email || !accountInfo.password || !accountInfo.firstName) {
                    toast.warning("Please fill in all account details");
                    setIsSubmitting(false);
                    return;
                }

                if (accountInfo.password !== accountInfo.confirmPassword) {
                    toast.warning("Passwords do not match");
                    setIsSubmitting(false);
                    return;
                }

                const { orderId } = await authApi.guestOrder({
                    user: accountInfo,
                    profile: { gender, measurements },
                    order: orderData
                });
                router.push(`/design/selection/${orderId}`);
            }
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayedSteps = isLoggedIn ? STEPS.filter(s => s.id !== 2 && s.id !== 5) : STEPS;

    if (isLoadingAuth) return <div className="text-center text-white p-10">Loading...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="mb-12 hidden md:block">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10" />
                    {displayedSteps.map((step) => {
                        const status = currentStep === step.id ? 'active' : (step.id < currentStep ? 'completed' : 'pending');
                        const isActive = status === 'active';
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${isActive || status === 'completed'
                                    ? "border-indigo-500 bg-indigo-500 text-white"
                                    : "border-white/20 bg-slate-900 text-white/50"
                                    }`}>
                                    {step.id}
                                </div>
                                <div className="text-center">
                                    <div className={`text-sm font-medium ${isActive ? "text-white" : "text-white/50"}`}>{step.title}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={(e) => e.preventDefault()} className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-12 border border-white/10"
                        >
                            {currentStep === 1 && <CategoryStyleForm />}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Let's Get Your Fit</h2>
                                        <GenderSelector value={gender} onChange={handleGenderChange} />
                                    </div>
                                    <div className="mt-8 bg-slate-900/50 p-6 rounded-xl border border-white/5">
                                        {gender === 'male' ? (
                                            <MaleMeasurementsForm measurements={measurements} onChange={setMeasurements} />
                                        ) : (
                                            <FemaleMeasurementsForm measurements={measurements} onChange={setMeasurements} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && <DesignDetailForm />}
                            {currentStep === 4 && <SpecForm />}

                            {currentStep === 5 && (
                                <div className="space-y-6 max-w-md mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <input type="text" placeholder="First Name" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                            value={accountInfo.firstName} onChange={e => handleAccountChange('firstName', e.target.value)} />
                                        <input type="text" placeholder="Last Name" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                            value={accountInfo.lastName} onChange={e => handleAccountChange('lastName', e.target.value)} />
                                        <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                            value={accountInfo.email} onChange={e => handleAccountChange('email', e.target.value)} />

                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white pr-10"
                                                value={accountInfo.password}
                                                onChange={e => handleAccountChange('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <input
                                            type="password"
                                            placeholder="Confirm Password"
                                            className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                            value={accountInfo.confirmPassword}
                                            onChange={e => handleAccountChange('confirmPassword', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between mt-8">
                        {currentStep > 1 && (
                            <button onClick={prevStep} className="flex items-center gap-2 text-slate-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                        <div className="ml-auto">
                            {(currentStep === 5 || (isLoggedIn && currentStep === 4)) ? (
                                <GlowButton onClick={methods.handleSubmit(onSubmit)} variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : (isLoggedIn ? "Submit Request" : "Complete & Submit")}
                                </GlowButton>
                            ) : (
                                <GlowButton onClick={async () => {
                                    let fieldsToValidate: any[] = [];
                                    if (currentStep === 1) fieldsToValidate = ["category", "style"];
                                    if (currentStep === 3) fieldsToValidate = ["images", "complexity"];
                                    if (currentStep === 4) fieldsToValidate = ["urgency"];

                                    if (currentStep === 2 && Object.keys(measurements).length === 0) {
                                        toast.warning("Please enter measurements");
                                        return;
                                    }

                                    const valid = await methods.trigger(fieldsToValidate);
                                    if (valid) nextStep();
                                }}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </GlowButton>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}

export function DesignWizardEnhanced() {
    return (
        <Suspense fallback={<div className="text-white">Loading wizard...</div>}>
            <WizardContent />
        </Suspense>
    );
}
