
"use client";

import { useEffect, useState } from 'react';
import { adminApi, User } from '@/lib/api-client';
import { Search, Shield, User as UserIcon, Scissors, MoreVertical, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await adminApi.getUsers();
            setUsers(data.users);
        } catch (err) {
            console.error("Failed to load users", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: 'customer' | 'designer' | 'admin') => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        setUpdatingUserId(userId);
        try {
            await adminApi.updateUserRole(userId, newRole);
            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert('Failed to update role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleStatusUpdate = async (userId: string, newStatus: string) => {
        if (!confirm(`Change user status to ${newStatus}?`)) return;
        try {
            await adminApi.updateUserStatus(userId, { status: newStatus });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleVerificationToggle = async (userId: string, currentVal: boolean) => {
        try {
            await adminApi.updateUserStatus(userId, { isVerified: !currentVal });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentVal } : u));
        } catch (err) {
            alert('Failed to update verification');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            await adminApi.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-4 h-4 text-purple-600" />;
            case 'designer': return <Scissors className="w-4 h-4 text-pink-600" />;
            case 'customer': return <UserIcon className="w-4 h-4 text-blue-600" />;
            default: return <UserIcon className="w-4 h-4 text-slate-600" />;
        }
    };

    if (isLoading) return <div>Loading users...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                                                {user.isVerified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">VERIFIED</span>}
                                            </div>
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getRoleIcon(user.role)}
                                        <select
                                            className="text-sm border-none bg-transparent hover:bg-slate-100 rounded px-1 -ml-1 cursor-pointer focus:ring-0"
                                            value={user.role}
                                            disabled={updatingUserId === user.id}
                                            onChange={(e) => handleRoleUpdate(user.id, e.target.value as any)}
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="designer">Designer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                        user.status === 'disabled' ? 'bg-gray-100 text-gray-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        {/* Status Toggle */}
                                        <button
                                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                                            onClick={() => handleStatusUpdate(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                            className={`p-1.5 rounded hover:bg-slate-100 ${user.status === 'active' ? 'text-amber-500' : 'text-green-600'}`}
                                        >
                                            <Shield size={16} />
                                        </button>

                                        {/* Verify Toggle */}
                                        <button
                                            title={user.isVerified ? 'Unverify' : 'Verify Identity'}
                                            onClick={() => handleVerificationToggle(user.id, user.isVerified || false)}
                                            className={`p-1.5 rounded hover:bg-slate-100 ${user.isVerified ? 'text-blue-600' : 'text-slate-400'}`}
                                        >
                                            <Shield size={16} className={user.isVerified ? "fill-current" : ""} />
                                        </button>

                                        {/* View Details */}
                                        <Link href={`/admin/users/${user.id}`} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="View Details">
                                            <MoreVertical size={16} />
                                        </Link>

                                        {/* Delete */}
                                        <button
                                            title="Delete User"
                                            onClick={() => handleDelete(user.id)}
                                            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </div >
    );
}
