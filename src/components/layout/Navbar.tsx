"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, User as UserIcon, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { authApi, User } from "@/lib/api-client"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [user, setUser] = React.useState<User | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await authApi.me()
                setUser(data.user)
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    const handleLogout = async () => {
        try {
            await authApi.logout()
            setUser(null)
            router.push("/")
            router.refresh()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight">MyGarms</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden gap-6 md:flex">
                    <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-primary">
                        Collections
                    </Link>
                    <Link href="/design" className="text-sm font-medium transition-colors hover:text-primary">
                        Design
                    </Link>
                    <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                        My Profile
                    </Link>
                    {user?.role === 'designer' && (
                        <Link href="/designer" className="text-sm font-medium transition-colors hover:text-primary">
                            Designer Portal
                        </Link>
                    )}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    <Button variant="ghost" size="icon">
                        <ShoppingBag className="h-5 w-5" />
                        <span className="sr-only">Cart</span>
                    </Button>

                    {!isLoading && (
                        user ? (
                            <>
                                <Link href="/profile">
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm">Create Account</Button>
                                </Link>
                            </>
                        )
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center md:hidden">
                    <Button variant="ghost" size="icon">
                        <ShoppingBag className="h-5 w-5 mr-2" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t p-4 bg-background">
                    <nav className="grid gap-4">
                        <Link
                            href="/gallery"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Collections
                        </Link>
                        <Link
                            href="/design"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Design
                        </Link>
                        <Link
                            href="/profile"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            My Profile
                        </Link>
                        {user?.role === 'designer' && (
                            <Link
                                href="/designer"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                Designer Portal
                            </Link>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                            {!isLoading && (
                                user ? (
                                    <>
                                        <div className="text-sm text-muted-foreground px-2">
                                            Signed in as {user.firstName} {user.lastName}
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setIsOpen(false); }}>
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full">Sign In</Button>
                                        </Link>
                                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full">Create Account</Button>
                                        </Link>
                                    </>
                                )
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
