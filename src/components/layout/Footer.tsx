import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-background py-6 md:py-12">
            <div className="container mx-auto grid gap-8 px-4 md:px-6 lg:grid-cols-4">
                <div className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold">MyGarms</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        Premium custom apparel designed by you.
                    </p>
                </div>
                <div className="grid gap-2">
                    <h3 className="text-sm font-semibold">Shop</h3>
                    <Link href="/gallery" className="text-sm text-muted-foreground hover:underline">
                        Collections
                    </Link>
                    <Link href="/design" className="text-sm text-muted-foreground hover:underline">
                        Design Studio
                    </Link>
                    <Link href="/gallery" className="text-sm text-muted-foreground hover:underline">
                        Browse Fabrics
                    </Link>
                </div>
                <div className="grid gap-2">
                    <h3 className="text-sm font-semibold">Account</h3>
                    <Link href="/profile" className="text-sm text-muted-foreground hover:underline">
                        My Profile
                    </Link>
                    <Link href="/profile" className="text-sm text-muted-foreground hover:underline">
                        Measurements
                    </Link>
                    <Link href="/profile" className="text-sm text-muted-foreground hover:underline">
                        Order History
                    </Link>
                </div>
                <div className="grid gap-2">
                    <h3 className="text-sm font-semibold">Legal</h3>
                    <Link href="#" className="text-sm text-muted-foreground hover:underline">
                        Privacy Policy
                    </Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:underline">
                        Terms of Service
                    </Link>
                </div>
            </div>
            <div className="container mx-auto mt-8 border-t pt-8 px-4 md:px-6">
                <p className="text-center text-xs text-muted-foreground">
                    © 2026 MyGarms Inc. All rights reserved.
                </p>
            </div>
        </footer>
    )
}
