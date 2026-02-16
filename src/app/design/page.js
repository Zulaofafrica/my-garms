"use client";

import { useState, useEffect } from "react";
import styles from "./design.module.css";
// import { TEMPLATES, FABRICS } from "@/lib/data"; // Removed static import
import FabricCard from "@/components/Gallery/FabricCard";
import PreviewCanvas from "@/components/ThreeD/PreviewCanvas";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const STEPS = ["Select Template", "Confirm Fit", "Choose Fabric", "Review & Order"];

export default function DesignPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selection, setSelection] = useState({
        template: null,
        fabric: null,
    });

    // Dynamic Data State
    const [templates, setTemplates] = useState([]);
    const [fabrics, setFabrics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/content');
                if (res.ok) {
                    const data = await res.json();
                    setTemplates(data.templates || []);
                    setFabrics(data.fabrics || []);
                }
            } catch (error) {
                console.error("Failed to load content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const handleTemplateSelect = (template) => {
        setSelection({ ...selection, template });
    };

    const handleFabricSelect = (fabric) => {
        setSelection({ ...selection, fabric });
    };

    const renderStep = () => {
        if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

        switch (currentStep) {
            case 0:
                return (
                    <div className={styles.grid}>
                        {templates.map((t) => (
                            <div
                                key={t.id}
                                className={`${styles.optionCard} ${selection.template?.id === t.id ? styles.selected : ""}`}
                                onClick={() => handleTemplateSelect(t)}
                            >
                                <div className={styles.optionIcon}>{t.name[0]}</div>
                                <h3>{t.name}</h3>
                                <p>{t.category}</p>
                                {selection.template?.id === t.id && <Check className={styles.check} />}
                            </div>
                        ))}
                    </div>
                );
            case 1:
                return (
                    <div className={styles.measurementsReview}>
                        <h3>Using measurements from your profile</h3>
                        <div className={styles.measurementGrid}>
                            <div className={styles.mItem}><label>Chest</label><span>38"</span></div>
                            <div className={styles.mItem}><label>Waist</label><span>32"</span></div>
                            <div className={styles.mItem}><label>Hips</label><span>40"</span></div>
                            <div className={styles.mItem}><label>Shoulders</label><span>18"</span></div>
                        </div>
                        <p className={styles.note}>You can update these in your profile settings.</p>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.fabricGrid}>
                        {fabrics.map((f) => (
                            <div key={f.id} className={selection.fabric?.id === f.id ? styles.selectedFabric : ""}>
                                <FabricCard
                                    fabric={f}
                                    onSelect={handleFabricSelect}
                                />
                            </div>
                        ))}
                    </div>
                );
            case 3:
                return (
                    <div className={styles.reviewLayout}>
                        <div className={styles.previewContainer}>
                            <PreviewCanvas selectedFabric={selection.fabric} selectedTemplate={selection.template} />
                        </div>
                        <div className={styles.summary}>
                            <h3>Order Summary</h3>
                            <div className={styles.summaryRow}>
                                <span>Template</span>
                                <span>{selection.template?.name || "N/A"}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Fabric</span>
                                <span>{selection.fabric?.name || "N/A"}</span>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.summaryRow}>
                                <span>Base Price</span>
                                <span>₦225,000</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Fabric Cost</span>
                                <span>₦{(selection.fabric?.price || 0).toLocaleString()}</span>
                            </div>
                            <div className={`${styles.summaryRow} ${styles.total}`}>
                                <span>Total</span>
                                <span>₦{(225000 + (selection.fabric?.price || 0)).toLocaleString()}</span>
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '1rem' }}
                                onClick={() => alert("Order placed successfully! (MVP Mock)")}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container">
            <div className={styles.wizard}>
                <div className={styles.progress}>
                    {STEPS.map((step, idx) => (
                        <div key={idx} className={`${styles.step} ${idx <= currentStep ? styles.activeStep : ""}`}>
                            <div className={styles.stepNumber}>{idx + 1}</div>
                            <span className={styles.stepLabel}>{step}</span>
                            {idx < STEPS.length - 1 && <div className={styles.stepLine} />}
                        </div>
                    ))}
                </div>

                <div className={styles.stepContent}>
                    <h2 className={styles.stepTitle}>{STEPS[currentStep]}</h2>
                    {renderStep()}
                </div>

                <div className={styles.actions}>
                    <button
                        className="btn btn-outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft size={16} style={{ marginRight: 8 }} /> Back
                    </button>

                    {currentStep < 3 && (
                        <button
                            className="btn btn-primary"
                            onClick={nextStep}
                            disabled={
                                (currentStep === 0 && !selection.template) ||
                                (currentStep === 2 && !selection.fabric)
                            }
                        >
                            Next <ChevronRight size={16} style={{ marginLeft: 8 }} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
