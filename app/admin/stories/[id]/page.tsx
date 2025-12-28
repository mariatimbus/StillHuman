'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StoryDetail {
    id: string;
    narrative_redacted: string;
    created_at: string;
    status: string;
    country?: string;
    area_type?: string;
    age_range?: string;
    identity_tags?: string[];
    context_tags?: string[];
    power_tags?: string[];
    impact_tags?: string[];
    risk_flags?: string[];
    allow_aggregate: boolean;
    allow_excerpt: boolean;
    allow_public_story: boolean;
    allow_lantern_notes: boolean;
}

export default function StoryDetailPage({ params }: { params: { id: string } }) {
    const [story, setStory] = useState<StoryDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchStory();
    }, []);

    const fetchStory = async () => {
        try {
            const response = await fetch(`/api/admin/stories/${params.id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setStory(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (newStatus: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this story?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/stories/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');

            router.push('/admin/stories');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update story status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Story not found</p>
                    <Link href="/admin/stories" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                        ← Back to Stories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link href="/admin/stories" className="text-blue-600 hover:text-blue-700 text-sm">
                        ← Back to Stories
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Story Details</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${story.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    story.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {story.status}
                            </span>
                            <p className="text-sm text-gray-600 mt-2">
                                Submitted: {new Date(story.created_at).toLocaleString()}
                            </p>
                        </div>
                        {story.status === 'pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleModerate('approved')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    onClick={() => handleModerate('rejected')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-3">Story Narrative</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                        <p className="text-gray-800 whitespace-pre-wrap">{story.narrative_redacted}</p>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-3">Demographics</h2>
                    <dl className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Country</dt>
                            <dd className="text-sm text-gray-900">{story.country || 'Not specified'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Area Type</dt>
                            <dd className="text-sm text-gray-900">{story.area_type || 'Not specified'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Age Range</dt>
                            <dd className="text-sm text-gray-900">{story.age_range || 'Not specified'}</dd>
                        </div>
                    </dl>

                    <h2 className="text-lg font-bold text-gray-900 mb-3">Tags & Flags</h2>
                    <div className="space-y-3 mb-6">
                        {story.context_tags && story.context_tags.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Context</p>
                                <div className="flex flex-wrap gap-1">
                                    {story.context_tags.map((tag, i) => (
                                        <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {story.risk_flags && story.risk_flags.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">⚠️ Risk Flags</p>
                                <div className="flex flex-wrap gap-1">
                                    {story.risk_flags.map((tag, i) => (
                                        <span key={i} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-3">Privacy Settings</h2>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Public Display</dt>
                            <dd className="text-sm">{story.allow_public_story ? '✓ Yes' : '✗ No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Lantern Notes</dt>
                            <dd className="text-sm">{story.allow_lantern_notes ? '✓ Yes' : '✗ No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Aggregate Data</dt>
                            <dd className="text-sm">{story.allow_aggregate ? '✓ Yes' : '✗ No'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-600">Excerpts</dt>
                            <dd className="text-sm">{story.allow_excerpt ? '✓ Yes' : '✗ No'}</dd>
                        </div>
                    </dl>
                </div>
            </main>
        </div>
    );
}
