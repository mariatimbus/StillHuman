'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Story {
    id: string;
    narrative_redacted: string;
    created_at: string;
    status: string;
    context_tags?: string[];
    risk_flags?: string[];
    allow_public_story: boolean;
}

export default function StoriesModerationPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all'>('all');
    const router = useRouter();

    useEffect(() => {
        fetchStories();
    }, [filter]);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/stories?status=${filter}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setStories(data.stories || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };



    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            deleted: 'bg-gray-100 text-gray-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm">
                            ← Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 mt-1">
                            Story Management
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Stories List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading stories...</p>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-600">No stories found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {stories.map((story) => (
                            <div key={story.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(story.status)}`}>
                                                {story.status}
                                            </span>
                                            {story.risk_flags && story.risk_flags.length > 0 && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    ⚠️ Risk Flags
                                                </span>
                                            )}
                                            {!story.allow_public_story && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    🔒 Private
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Submitted: {new Date(story.created_at).toLocaleString()}
                                        </p>
                                        {story.context_tags && story.context_tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {story.context_tags.map((tag, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                                    {story.narrative_redacted.substring(0, 300)}
                                    {story.narrative_redacted.length > 300 && '...'}
                                </p>

                                <div className="flex gap-2">
                                    <Link href={`/admin/stories/${story.id}`}>
                                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                                            View Full Story
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
