'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PIIWarning from '@/components/PIIWarning';
import { TAG_OPTIONS, AREA_TYPES, AGE_RANGES } from '@/lib/types';
import type { StorySubmission } from '@/lib/types';

export default function SubmitPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [narrative, setNarrative] = useState('');
    const [formData, setFormData] = useState<StorySubmission>({
        narrative: '',
        allow_aggregate: true,
        allow_excerpt: false,
        allow_public_story: true, // Changed to true so stories appear on homepage
        allow_lantern_notes: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted!');
        setLoading(true);
        setError('');

        try {
            console.log('Fetching API...');
            const response = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, narrative }),
            });

            console.log('Response received:', response.status);
            const data = await response.json();
            console.log('Data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit story');
            }

            // Store the newly submitted story for instant display on home page
            const newStory = {
                id: 'temp-' + Date.now(),
                narrative_redacted: narrative,
                created_at: new Date().toISOString(),
                context_tags: formData.context_tags || [],
                impact_tags: formData.impact_tags || [],
                status: 'pending',
                _timestamp: Date.now(), // For expiry check
            };

            // Get existing pending stories array
            const existingPending = localStorage.getItem('pending_stories');
            let pendingArray = existingPending ? JSON.parse(existingPending) : [];

            // Add new story to the beginning
            pendingArray.unshift(newStory);

            // Keep only stories from last 5 minutes (300000ms)
            const fiveMinutesAgo = Date.now() - 300000;
            pendingArray = pendingArray.filter((s: any) => s._timestamp > fiveMinutesAgo);

            // Store updated array
            localStorage.setItem('pending_stories', JSON.stringify(pendingArray));

            // Store codes in sessionStorage (temporary, for thank you page)
            sessionStorage.setItem('submission_data', JSON.stringify(data));
            console.log('Stored in sessionStorage');

            // Also encode in URL as backup (base64 encoded)
            const encodedData = btoa(JSON.stringify(data));

            // Redirect to thank you page using window.location for reliability
            console.log('Redirecting...');
            window.location.href = `/submit/thank-you#${encodedData}`;
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-powder-blush py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                        Share Your Story
                    </h1>
                    <p className="text-text-secondary">
                        Your experience is valid. Your story matters. This is a safe, anonymous space.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                        {/* Demographics (Optional) */}
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-text-primary mb-3">
                                About You (All Optional)
                            </h2>
                            <p className="text-sm text-text-secondary mb-4">
                                This helps with research but is completely optional.
                            </p>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="e.g., United States"
                                        value={formData.country || ''}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Area Type
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.area_type || ''}
                                        onChange={(e) => setFormData({ ...formData, area_type: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        {AREA_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">
                                        Age Range
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={formData.age_range || ''}
                                        onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        {AGE_RANGES.map(range => (
                                            <option key={range} value={range}>{range}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Where did this happen?
                                </label>
                                <select
                                    multiple
                                    className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                                    value={formData.context_tags || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, context_tags: values });
                                    }}
                                >
                                    {TAG_OPTIONS.context.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-text-muted mt-1">Hold Ctrl/Cmd to select multiple</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Who was involved? (Your relationship to them)
                                </label>
                                <select
                                    multiple
                                    className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                                    value={formData.power_tags || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, power_tags: values });
                                    }}
                                >
                                    {TAG_OPTIONS.power.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    How did this impact you?
                                </label>
                                <select
                                    multiple
                                    className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32"
                                    value={formData.impact_tags || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, impact_tags: values });
                                    }}
                                >
                                    {TAG_OPTIONS.impact.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-2">
                                    Risk or safety concerns (if any)
                                </label>
                                <select
                                    multiple
                                    className="w-full px-4 py-2 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-24"
                                    value={formData.risk_flags || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value);
                                        setFormData({ ...formData, risk_flags: values });
                                    }}
                                >
                                    {TAG_OPTIONS.risk.map(tag => (
                                        <option key={tag} value={tag}>{tag}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Narrative */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Your Story <span className="text-error">*</span>
                            </label>
                            <p className="text-sm text-text-secondary mb-3">
                                Share what happened in your own words. Avoid including identifying information like names, schools, or contact details.
                            </p>
                            <textarea
                                required
                                className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-64 resize-y"
                                placeholder="Tell your story here..."
                                value={narrative}
                                onChange={(e) => setNarrative(e.target.value)}
                                minLength={50}
                                maxLength={10000}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-text-muted">Minimum 50 characters</p>
                                <p className="text-xs text-text-muted">{narrative.length} / 10,000</p>
                            </div>

                            {/* PII Warning */}
                            <PIIWarning text={narrative} />
                        </div>

                        {/* Privacy Settings */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-text-primary mb-3">Privacy Preferences</h3>

                            <label className="flex items-start mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 mr-3"
                                    checked={formData.allow_aggregate}
                                    onChange={(e) => setFormData({ ...formData, allow_aggregate: e.target.checked })}
                                />
                                <div>
                                    <span className="font-semibold text-text-primary">Allow aggregated research use</span>
                                    <p className="text-sm text-text-secondary">Your story can be included in anonymous statistics and research reports.</p>
                                </div>
                            </label>

                            <label className="flex items-start mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 mr-3"
                                    checked={formData.allow_excerpt}
                                    onChange={(e) => setFormData({ ...formData, allow_excerpt: e.target.checked })}
                                />
                                <div>
                                    <span className="font-semibold text-text-primary">Allow brief excerpts in reports</span>
                                    <p className="text-sm text-text-secondary">Short, heavily redacted quotes may be used in public reports.</p>
                                </div>
                            </label>

                            <label className="flex items-start mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 mr-3"
                                    checked={formData.allow_lantern_notes}
                                    onChange={(e) => setFormData({ ...formData, allow_lantern_notes: e.target.checked })}
                                />
                                <div>
                                    <span className="font-semibold text-text-primary">Receive Lantern Notes</span>
                                    <p className="text-sm text-text-secondary">Get supportive messages from others. You&apos;ll receive an inbox code to view them privately.</p>
                                </div>
                            </label>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || narrative.length < 50}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Your Story'}
                        </button>

                        <p className="text-xs text-text-muted mt-3 text-center">
                            By submitting, you acknowledge that your story will be reviewed and may be redacted for privacy.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
