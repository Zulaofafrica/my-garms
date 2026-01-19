import { DesignWizardEnhanced } from "@/components/design-flow/design-wizard-enhanced";

export default function DesignPage() {
    return (
        <main className="h-screen w-full relative overflow-y-auto bg-slate-950">
            {/* Background Gradients */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full" />
            </div>

            <div className="container py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Start Your Custom Order</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Tell us what you want to create.</p>
                </div>
                <DesignWizardEnhanced />
            </div>
        </main>
    );
}
