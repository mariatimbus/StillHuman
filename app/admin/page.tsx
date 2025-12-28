'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
    pendingStories: number;
    pendingNotes: number;
    totalStories: number;
    totalNotes: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Still Human - Admin Console
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600 mb-1">Pending Stories</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {stats?.pendingStories || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600 mb-1">Pending Notes</p>
                                <p className="text-3xl font-bold text-yellow-600">
                                    {stats?.pendingNotes || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600 mb-1">Total Stories</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {stats?.totalStories || 0}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <p className="text-sm text-gray-600 mb-1">Total Notes</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {stats?.totalNotes || 0}
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link href="/admin/stories">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-left">
                                        <div className="text-lg">Moderate Stories</div>
                                        <div className="text-sm opacity-90 mt-1">
                                            {stats?.pendingStories || 0} pending review
                                        </div>
                                    </button>
                                </Link>
                                <Link href="/admin/notes">
                                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-left">
                                        <div className="text-lg">Moderate Lantern Notes</div>
                                        <div className="text-sm opacity-90 mt-1">
                                            {stats?.pendingNotes || 0} pending review
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                            <p className="font-semibold mb-1">Admin Dashboard</p>
                            <p>Review and moderate submitted content before it appears publicly. All actions are logged for audit purposes.</p>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
