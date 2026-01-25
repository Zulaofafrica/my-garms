
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h1>
                <p className="text-slate-600 mb-8">
                    Your account has been suspended due to a violation of our terms or suspicious activity.
                    You cannot perform any actions while your account is in this state.
                </p>

                <div className="space-y-3">
                    <a
                        href="mailto:support@mygarms.com"
                        className="block w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Contact Support
                    </a>
                    <Link
                        href="/"
                        className="block w-full py-3 text-slate-500 hover:text-slate-800 font-medium transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
