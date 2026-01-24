"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowButton } from "@/components/ui/glow-button";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { SpecForm } from "./spec-form";
import { CategoryStyleForm } from "./CategoryStyleForm";

const formSchema = z.object({
    images: z.array(z.any()).min(1, "Please upload at least one image"),
    category: z.string().min(1, "Please select a category"),
    fabric: z.string().optional(),
    color: z.string().optional(),
    style: z.string().min(1, "Please select a style"),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
    { id: 1, title: "Inspiration", description: "Upload your mood board" },
    { id: 2, title: "Specifications", description: "Choose your materials" },
    { id: 3, title: "Style Profile", description: "Define your vibe" },
];

import { ordersApi, profilesApi } from "@/lib/api-client";
import { useEffect } from "react";

// ... (existing imports)

export function DesignRequestWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [userProfileId, setUserProfileId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch user profile to link with order
        const loadProfile = async () => {
            try {
                const data = await profilesApi.list();
                if (data.profiles.length > 0) {
                    setUserProfileId(data.profiles[0].id);
                }
            } catch (err) {
                console.error("Failed to load profiles", err);
            }
        };
        loadProfile();
    }, []);

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            images: [],
        },
    });

    const nextStep = () => setCurrentStep((p) => Math.min(STEPS.length, p + 1));
    const prevStep = () => setCurrentStep((p) => Math.max(1, p - 1));

    const onSubmit = async (data: FormData) => {
        if (!userProfileId) {
            alert("Please create a measurement profile in your account first.");
            router.push("/profile");
            return;
        }

        setIsSubmitting(true);
        try {
            // Mock image uploads for MVP
            const imageUrls = data.images.map((file: any, index: number) =>
                `https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600&mock_id=${index}`
            );

            await ordersApi.create({
                profileId: userProfileId,
                templateId: "custom-template",
                templateName: data.style || "Custom Request",
                fabricId: "custom-fabric",
                fabricName: data.fabric || "Custom Fabric",
                total: 0, // 0 indicates "Calculating" for now, designer sets price
                images: imageUrls,
                category: data.category as any, // Add category to order
                style: data.style,
                color: data.color,
                notes: "Please review my design request.",
            });

            router.push("/profile"); // Redirect to profile to see the order
        } catch (error) {
            console.error("Submission failed:", error);
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            {/* Progress */}
            <div className="mb-12">
                <div className="flex justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10" />
                    {STEPS.map((step, i) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
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

            {/* Content */}
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
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <h2 className="text-2xl font-bold font-heading">Upload Inspiration</h2>
                                        <p className="text-muted-foreground">Share screenshots, mood boards, or sketches of what you want.</p>
                                    </div>
                                    <ImageUpload name="images" />
                                </div>
                            )}
                            {currentStep === 2 && <SpecForm />}
                            {currentStep === 3 && <CategoryStyleForm />}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <div className="w-32">
                            {currentStep > 1 && (
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
                            {currentStep < STEPS.length ? (
                                <GlowButton type="button" onClick={async (e) => {
                                    e.preventDefault(); // Prevent form submission
                                    const valid = await methods.trigger(currentStep === 1 ? ["images"] : []);
                                    if (valid) nextStep();
                                }}>
                                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                                </GlowButton>
                            ) : (
                                <GlowButton type="submit" variant="primary">
                                    Submit Request
                                </GlowButton>
                            )}
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
