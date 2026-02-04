
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    AlertTriangle,
    FileText,
    LogOut,
    Menu,
    X,
    Palette
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [accessCode, setAccessCode] = useState('');
    const [accessError, setAccessError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const res = await fetch('/api/admin/me');
            const data = await res.json();
            setIsAuthenticated(data.authenticated);
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccessError('');
        setIsVerifying(true);

        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                body: JSON.stringify({ accessCode }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Determine success and reload/state update
                setIsAuthenticated(true);
            } else {
                setAccessError(data.error || 'Invalid code');
            }
        } catch (err) {
            setAccessError('Verification failed');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleLogout = async () => {
        // We'd need an endpoint for this, or just clear cookie if we could (HttpOnly prevents client clear).
        // Let's reload for now, the cookie persists. 
        // Ideally we need /api/admin/logout.
        // For now, assume session expires or we implement logout later.
        router.push('/');
    };

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    // If not authenticated, show Access Code Gate
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard Access</h1>
                        <p className="text-slate-500 mt-2">Enter your access code to continue</p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-4">
                        {accessError && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                <AlertTriangle size={16} />
                                {accessError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Access Code</label>
                            <input
                                type="password"
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Enter access code"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? 'Verifying...' : 'Access Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const navItems = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/users', label: 'User Management', icon: Users },
        { href: '/admin/orders', label: 'Orders & Assignment', icon: ShoppingBag },
        { href: '/admin/designs', label: 'Curated Designs', icon: Palette },
        { href: '/admin/disputes', label: 'Disputes', icon: AlertTriangle },
        { href: '/admin/logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white w-64 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Admin Portal</h1>
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/5 w-full rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50">
                <div className="md:hidden p-4 bg-white shadow-sm flex items-center">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold">Admin Portal</span>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
