"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { CategoryStyleForm } from "./CategoryStyleForm";
import { DesignDetailForm } from "./DesignDetailForm";
import { SpecForm } from "./spec-form";
import { ordersApi, profilesApi, authApi } from "@/lib/api-client";
import { GenderSelector } from "@/components/profile/GenderSelector";
import { MaleMeasurementsForm } from "@/components/profile/MaleMeasurementsForm";
import { FemaleMeasurementsForm } from "@/components/profile/FemaleMeasurementsForm";
import { Gender, MaleMeasurements, FemaleMeasurements } from "@/lib/types";

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

export function DesignWizardEnhanced() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userProfileId, setUserProfileId] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    // Guest Flow State
    const [gender, setGender] = useState<Gender>("male");
    const [measurements, setMeasurements] = useState<MaleMeasurements | FemaleMeasurements | any>({});
    const [accountInfo, setAccountInfo] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await authApi.me();
                if (me.user) {
                    setIsLoggedIn(true);
                    // Fetch existing profile
                    const pData = await profilesApi.list();
                    if (pData.profiles.length > 0) {
                        setUserProfileId(pData.profiles[0].id);
                        // Logged in users: Start at Vision (1) but SKIP Measurements (2) later
                    }
                }
            } catch (err) {
                // Not logged in
            } finally {
                setIsLoadingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const methods = useForm<DesignFormData>({
        resolver: zodResolver(designSchema),
        defaultValues: {
            images: [],
            fabricSource: 'unsure',
            budgetRange: 'standard'
        },
    });

    // Step Logic
    const nextStep = () => {
        // If Logged in, SKIP Step 2 (Measurements) assuming they have a profile
        // Wait, if they don't have a profile, we might want to show it?
        // For MVP simplicity: If logged in, we skip step 2.

        let next = currentStep + 1;
        if (isLoggedIn && next === 2) next = 3;

        // Skip step 5 if logged in (Submit logic handled at step 4 end)
        if (isLoggedIn && next === 5) {
            // Handle submit instead of going to step 5
            methods.handleSubmit(onSubmit)();
            return;
        }

        setCurrentStep(next);
    };

    const prevStep = () => {
        let prev = currentStep - 1;
        if (isLoggedIn && prev === 2) prev = 1;
        setCurrentStep(prev);
    };

    const handleGenderChange = (g: Gender) => {
        setGender(g);
        setMeasurements({}); // Reset on gender switch
    };

    const handleAccountChange = (field: string, value: string) => {
        setAccountInfo(prev => ({ ...prev, [field]: value }));
    };

    const onSubmit = async (data: DesignFormData) => {
        setIsSubmitting(true);
        try {
            // Prepare Image URLs (Mock)
            const imageUrls = data.images.map((file: any, index: number) =>
                typeof file === 'string' ? file : `https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600&mock_id=${index}`
            );

            const orderData = {
                // Required matching fields
                category: data.category,
                complexity: data.complexity,
                urgency: data.urgency,

                // Details
                templateId: "custom-template",
                templateName: `${data.category} - ${data.style}`, // Composite name
                fabricName: data.fabricSource === 'own' ? 'Client Fabric' : (data.fabric || "Custom Fabric"),

                total: 0, // Quote based
                images: imageUrls,

                style: data.style,
                color: data.color,
                notes: data.notes,

                // Extra metadata
                budgetRange: data.budgetRange,
                fabricSource: data.fabricSource,
            };

            if (isLoggedIn) {
                let targetProfileId = userProfileId;
                if (!targetProfileId) {
                    // Fallback create profile... (omitted for brevity, assume exists or recovered)
                    const pData = await profilesApi.list();
                    if (pData.profiles.length > 0) targetProfileId = pData.profiles[0].id;
                }

                if (!targetProfileId) {
                    alert("Profile error. Please check your profile.");
                    return;
                }

                await ordersApi.create({
                    profileId: targetProfileId,
                    fabricId: "custom-fabric", // Required by API type
                    ...orderData
                });
                router.push("/profile");
            } else {
                // Guest Flow
                if (!accountInfo.email || !accountInfo.password || !accountInfo.firstName) {
                    alert("Please fill in all account details");
                    setIsSubmitting(false);
                    return;
                }

                await authApi.guestOrder({
                    user: accountInfo,
                    profile: { gender, measurements },
                    order: orderData
                });
                router.push("/profile");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayedSteps = isLoggedIn ? STEPS.filter(s => s.id !== 2 && s.id !== 5) : STEPS;

    if (isLoadingAuth) return <div className="text-center text-white p-10">Loading...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Progress Bar */}
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
                            {/* Step 1: Vision */}
                            {currentStep === 1 && <CategoryStyleForm />}

                            {/* Step 2: Measurements (Guest Only) */}
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

                            {/* Step 3: Details */}
                            {currentStep === 3 && <DesignDetailForm />}

                            {/* Step 4: Logistics */}
                            {currentStep === 4 && <SpecForm />}

                            {/* Step 5: Account (Guest Only) */}
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
                                        <input type="password" placeholder="Password" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                            value={accountInfo.password} onChange={e => handleAccountChange('password', e.target.value)} />
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        {currentStep > 1 && (
                            <button onClick={prevStep} className="flex items-center gap-2 text-slate-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                        )}
                        <div className="ml-auto">
                            {/* If last step (5 for guest, 4 for user) */}
                            {(currentStep === 5 || (isLoggedIn && currentStep === 4)) ? (
                                <GlowButton onClick={methods.handleSubmit(onSubmit)} variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : (isLoggedIn ? "Submit Request" : "Complete & Submit")}
                                </GlowButton>
                            ) : (
                                <GlowButton onClick={async () => {
                                    // Validation triggers
                                    let fieldsToValidate: any[] = [];
                                    if (currentStep === 1) fieldsToValidate = ["category", "style"];
                                    if (currentStep === 3) fieldsToValidate = ["images", "complexity"];
                                    if (currentStep === 4) fieldsToValidate = ["urgency"];

                                    // Manual check for step 2 (measurements)
                                    if (currentStep === 2 && Object.keys(measurements).length === 0) {
                                        alert("Please enter measurements");
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
