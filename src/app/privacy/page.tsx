export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-24 px-4 md:px-6">
            <div className="container mx-auto max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-bold font-heading mb-8">Privacy Policy</h1>
                <p className="mb-8 text-sm text-muted-foreground">Last Updated: February 1, 2026</p>

                <div className="space-y-8 prose prose-lg max-w-none dark:prose-invert">
                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, submit a design request,
                            or communicate with us. This may include your name, email address, shipping address, and measurement data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use your information to provide, maintain, and improve our services. Specifically, your measurement profile
                            and design preferences are shared with assigned designers to fulfill your orders.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">3. Information Sharing</h2>
                        <p>
                            We do not sell your personal data. We only share information with third parties (like designers and shipping providers)
                            as necessary to deliver the services you requested.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">4. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal data against unauthorized
                            access, alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold font-heading mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@mygarms.com.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
