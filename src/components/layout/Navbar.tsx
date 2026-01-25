"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, ShoppingBag, User as UserIcon, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { NotificationBadge } from "@/components/ui/notification-badge"

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const router = useRouter()
    const { user, isLoading, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout()
            setIsOpen(false)
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
                    {/* Designer View: Only Designer Portal */}
                    {user?.role === 'designer' ? (
                        <Link href="/designer" className="text-sm font-medium transition-colors hover:text-primary">
                            Designer Portal
                        </Link>
                    ) : (
                        /* Customer / Guest View */
                        <>
                            <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-primary">
                                Collections
                            </Link>
                            <Link href="/design" className="text-sm font-medium transition-colors hover:text-primary">
                                Design
                            </Link>
                            {user && (
                                <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                                    My Profile
                                </Link>
                            )}
                        </>
                    )}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    {/* Cart only for customers/guests? Leaving it for now, as designers might buy too? Or maybe hide it? 
                        User said "only Designer portal". I will hide cart for designers just in case.
                    */}
                    {user?.role !== 'designer' && (
                        <Button variant="ghost" size="icon">
                            <ShoppingBag className="h-5 w-5" />
                            <span className="sr-only">Cart</span>
                        </Button>
                    )}

                    {user && <NotificationBadge />}

                    {!isLoading && (
                        user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground hidden lg:inline-block">
                                    {user.firstName}
                                </span>
                                <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout} title="Sign Out">
                                    <LogOut className="h-5 w-5 text-muted-foreground hover:text-red-400" />
                                </Button>
                            </div>
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
                    {user?.role !== 'designer' && (
                        <Button variant="ghost" size="icon">
                            <ShoppingBag className="h-5 w-5 mr-2" />
                        </Button>
                    )}
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
                        {user?.role === 'designer' ? (
                            <Link
                                href="/designer"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                Designer Portal
                            </Link>
                        ) : (
                            <>
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
                                {user && (
                                    <Link
                                        href="/profile"
                                        className="text-sm font-medium transition-colors hover:text-primary"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Profile
                                    </Link>
                                )}
                            </>
                        )}

                        <div className="flex flex-col gap-2 mt-4">
                            {!isLoading && (
                                user ? (
                                    <>
                                        <div className="text-sm text-muted-foreground px-2 pb-2 border-b mb-2">
                                            Signed in as <span className="font-semibold text-foreground">{user.firstName} {user.lastName}</span>
                                            <div className="text-xs opacity-70 capitalize">{user.role} Account</div>
                                        </div>
                                        <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
                                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
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
