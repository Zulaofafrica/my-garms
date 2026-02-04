export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-24 px-4 md:px-6">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-bold font-heading mb-8">Terms of Service</h1>
                <p className="mb-8 text-sm text-muted-foreground">Last Updated: February 1, 2026</p>

                <div className="space-y-8 prose prose-lg max-w-none dark:prose-invert">
                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using MyGarms, you agree to be bound by these Terms of Service. If you do not agree to these terms,
                            please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">2. Custom Orders</h2>
                        <p>
                            All garments are made to order based on your specifications. Due to the custom nature of our products,
                            returns are only accepted in cases of significant defects or deviations from the agreed design.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">3. Payments</h2>
                        <p>
                            We use secure third-party payment processors. Full payment or a deposit (as specified) is required to commence work on any custom order.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">4. User Content</h2>
                        <p>
                            You retain rights to any designs or content you submit. However, you grant MyGarms a license to use this content
                            to facilitate the design and production process.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">5. Disclaimer</h2>
                        <p>
                            MyGarms acts as a platform connecting users with designers. We are not responsible for the independent actions or
                            omissions of designers, though we facilitate dispute resolution.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
