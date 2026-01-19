"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { SpecForm } from "./spec-form";
import { StyleQuiz } from "./style-quiz";
import { ordersApi, profilesApi, authApi } from "@/lib/api-client";
import { GenderSelector } from "@/components/profile/GenderSelector";
import { MaleMeasurementsForm } from "@/components/profile/MaleMeasurementsForm";
import { FemaleMeasurementsForm } from "@/components/profile/FemaleMeasurementsForm";
import { Gender, MaleMeasurements, FemaleMeasurements } from "@/lib/types";

// Schema for the Design Request part (Steps 2-4)
const designSchema = z.object({
    images: z.array(z.any()).min(1, "Please upload at least one image"),
    fabric: z.string().optional(),
    color: z.string().optional(),
    style: z.string().optional(),
});

type DesignFormData = z.infer<typeof designSchema>;

const STEPS = [
    { id: 1, title: "Measurements", description: "Your fit details" },
    { id: 2, title: "Inspiration", description: "Upload your mood board" },
    { id: 3, title: "Specifications", description: "Choose your materials" },
    { id: 4, title: "Style Profile", description: "Define your vibe" },
    { id: 5, title: "Start Account", description: "Save & Submit" },
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
                        // Skip measurement step for logged-in users with profile
                        setCurrentStep(2);
                    }
                }
            } catch (err) {
                // Not logged in, stay on Step 1
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
        },
    });

    const nextStep = () => setCurrentStep((p) => Math.min(STEPS.length, p + 1));
    const prevStep = () => setCurrentStep((p) => Math.max(1, p - 1) === 1 && isLoggedIn ? 2 : Math.max(1, p - 1));

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
                `https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600&mock_id=${index}`
            );

            const orderData = {
                templateId: "custom-template",
                templateName: data.style || "Custom Request",
                fabricId: "custom-fabric",
                fabricName: data.fabric || "Custom Fabric",
                total: 0,
                images: imageUrls,
                style: data.style,
                color: data.color,
                notes: "Please review my design request.",
            };

            if (isLoggedIn && userProfileId) {
                // Regular Flow
                await ordersApi.create({
                    profileId: userProfileId,
                    ...orderData
                });
                router.push("/profile");
            } else {
                // Guest Flow
                // Validate Measurments & Account
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
                router.push("/profile"); // Should now be logged in
            }
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit request: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter steps based on auth status
    const displayedSteps = isLoggedIn ? STEPS.filter(s => s.id !== 1 && s.id !== 5) : STEPS;

    // Correct step index calculation for UI
    const getStepStatus = (stepId: number) => {
        if (stepId === currentStep) return "active";
        if (stepId < currentStep) return "completed";
        return "pending";
    };

    if (isLoadingAuth) return <div className="text-center text-white p-10">Loading...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Progress */}
            <div className="mb-12">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10" />
                    {displayedSteps.map((step) => {
                        const status = getStepStatus(step.id);
                        const isActive = status === 'active';
                        const isCompleted = status === 'completed';
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${isActive || isCompleted
                                        ? "border-accent bg-accent text-white"
                                        : "border-white/20 bg-slate-900 text-white/50"
                                        }`}
                                >
                                    {step.id}
                                </div>
                                <div className="text-center hidden sm:block">
                                    <div className={`text-sm font-medium ${isActive ? "text-white" : "text-white/50"}`}>
                                        {step.title}
                                    </div>
                                    <div className="text-xs text-white/30">{step.description}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-12 border border-white/10"
                        >
                            {/* Step 1: Measurements (Guest Only) */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Let's Get Your Fit</h2>
                                        <p className="text-muted-foreground">We need your measurements to create the perfect outfit.</p>
                                    </div>
                                    <GenderSelector value={gender} onChange={handleGenderChange} />
                                    <div className="mt-8 bg-slate-900/50 p-6 rounded-xl border border-white/5">
                                        {gender === 'male' ? (
                                            <MaleMeasurementsForm measurements={measurements} onChange={setMeasurements} />
                                        ) : (
                                            <FemaleMeasurementsForm measurements={measurements} onChange={setMeasurements} />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Inspiration */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-bold font-heading">Upload Inspiration</h2>
                                        <p className="text-muted-foreground">Share screenshots, mood boards, or sketches.</p>
                                    </div>
                                    <ImageUpload name="images" />
                                </div>
                            )}

                            {/* Step 3: Specs */}
                            {currentStep === 3 && <SpecForm />}

                            {/* Step 4: Style */}
                            {currentStep === 4 && <StyleQuiz />}

                            {/* Step 5: Account (Guest Only) */}
                            {currentStep === 5 && (
                                <div className="space-y-6 max-w-md mx-auto">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-white mb-2">Save Your Design</h2>
                                        <p className="text-muted-foreground">Create an account to track your order and future requests.</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">First Name</label>
                                                <input type="text" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                                    value={accountInfo.firstName} onChange={e => handleAccountChange('firstName', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Last Name</label>
                                                <input type="text" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                                    value={accountInfo.lastName} onChange={e => handleAccountChange('lastName', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Email</label>
                                            <input type="email" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                                value={accountInfo.email} onChange={e => handleAccountChange('email', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Password</label>
                                            <input type="password" className="w-full bg-slate-900 border border-white/10 rounded p-3 text-white"
                                                value={accountInfo.password} onChange={e => handleAccountChange('password', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <div className="w-32">
                            {/* Hide Back on Step 1 if guest, or Step 2 if logged in */}
                            {((!isLoggedIn && currentStep > 1) || (isLoggedIn && currentStep > 2)) && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            )}
                        </div>
                        <div>
                            {/* Next Logic: Check if last step */}
                            {currentStep < (isLoggedIn ? 4 : 5) ? (
                                <GlowButton type="button" onClick={async (e) => {
                                    e.preventDefault();
                                    // Custom validation for non-hook-form steps
                                    if (currentStep === 1 && !isLoggedIn) {
                                        // Basic check if measurements started?
                                        if (Object.keys(measurements).length < 3) {
                                            alert("Please enter your measurements first.");
                                            return;
                                        }
                                        nextStep();
                                    } else {
                                        const valid = await methods.trigger(currentStep === 2 ? ["images"] : []);
                                        if (valid || currentStep > 2) nextStep();
                                    }
                                }}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </GlowButton>
                            ) : (
                                <GlowButton type="submit" variant="primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : (isLoggedIn ? "Submit Request" : "Create Account & Submit")}
                                </GlowButton>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
