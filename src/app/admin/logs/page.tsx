
"use client";

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api-client';
import { FileText, Clock, User, Fingerprint } from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            try {
                const data = await adminApi.getAuditLogs();
                setLogs(data.logs);
            } catch (err) {
                console.error("Failed to load logs", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadLogs();
    }, []);

    if (isLoading) return <div>Loading logs...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Fingerprint className="text-slate-600" />
                    System Audit Logs
                </h1>
                <span className="text-sm text-slate-500">{logs.length} entries found</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-semibold text-slate-500">Timestamp</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Actor</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Action</th>
                                <th className="px-6 py-3 font-semibold text-slate-500">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="font-medium text-slate-700">{log.userEmail || log.userId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-medium">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-600 max-w-md truncate" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No audit logs available.
                    </div>
                )}
            </div>
        </div>
    );
}
