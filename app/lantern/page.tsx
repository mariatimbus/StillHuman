'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LanternPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [noteText, setNoteText] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const templates = [
        "What I wish someone had told me: You're not alone in this.",
        "What helped me: Finding people who believed me and supported me.",
        "What I want you to know: It's not your fault. You deserve better.",
        "What gives me hope: Seeing others speak up and knowing we're stronger together.",
        "What I learned: Your feelings are valid, and it's okay to take care of yourself first.",
    ];

    const handleTemplateSelect = (template: string) => {
        setSelectedTemplate(template);
        setNoteText(template);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/lantern-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note_text: noteText }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.reasons) {
                    throw new Error(data.reasons.join(', '));
                }
                throw new Error(data.error || 'Failed to submit note');
            }

            setSuccess(true);
            setNoteText('');
            setSelectedTemplate('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-powder-blush py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-surface-white rounded-lg shadow-md p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-3">
                            Your Light Has Been Sent
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Thank you for sharing your support. Your note will reach someone who needs it, and it will make a difference.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setSuccess(false)}
                                className="px-6 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-lg font-semibold transition-colors"
                            >
                                Send Another Note
                            </button>
                            <Link href="/">
                                <button className="px-6 py-2 bg-lavender-fog hover:bg-selection text-text-primary border border-border-soft rounded-lg font-semibold transition-colors">
                                    Return Home
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        Leave a Lantern Note
                    </h1>
                    <p className="text-text-secondary">
                        Your words of support will light the way for someone who needs it. Notes are randomly assigned to contributors.
                    </p>
                </div>

                {/* How It Works */}
                <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3">How the Lantern Pool Works</h2>
                    <ol className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-start">
                            <span className="font-bold text-accent mr-2">1.</span>
                            <span>You write a supportive message using a template or your own words.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-accent mr-2">2.</span>
                            <span>Our system randomly assigns your note to someone who opted to receive support.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-accent mr-2">3.</span>
                            <span>After moderation, they&apos;ll see your message privately in their inbox.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-accent mr-2">4.</span>
                            <span>Notes are never attached to specific public stories (for safety).</span>
                        </li>
                    </ol>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                        {/* Templates */}
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-text-primary mb-3">Choose a Template (Optional)</h3>
                            <div className="space-y-2">
                                {templates.map((template, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleTemplateSelect(template)}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${selectedTemplate === template
                                            ? 'border-accent bg-selection'
                                            : 'border-border-soft hover:border-accent hover:bg-lavender-fog'
                                            }`}
                                    >
                                        <p className="text-sm text-text-primary">{template}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Note */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Your Supportive Message <span className="text-error">*</span>
                            </label>
                            <p className="text-sm text-text-secondary mb-3">
                                You can edit a template or write your own message. Keep it supportive and kind.
                            </p>
                            <textarea
                                required
                                className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent h-40 resize-y"
                                placeholder="Write your message of support here..."
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                minLength={10}
                                maxLength={1000}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-text-muted">Minimum 10 characters</p>
                                <p className="text-xs text-text-muted">{noteText.length} / 1,000</p>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div className="mb-6 bg-highlight border-l-4 border-warning rounded-lg p-4">
                            <h4 className="font-semibold text-text-primary mb-2">Guidelines</h4>
                            <ul className="text-sm text-text-secondary space-y-1">
                                <li>✓ Be supportive, validating, and kind</li>
                                <li>✓ Share what helped you or what you wish you had heard</li>
                                <li>✗ Don&apos;t include contact information (email, phone, social media)</li>
                                <li>✗ Don&apos;t give specific advice about confrontation or legal action</li>
                                <li>✗ Don&apos;t minimize or question their experience</li>
                            </ul>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || noteText.length < 10}
                            className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Your Light'}
                        </button>
                    </div>
                </form>

                {/* Additional Info */}
                <div className="text-center text-text-muted text-sm">
                    <p>Your note will be reviewed before being shared to ensure it&apos;s safe and supportive.</p>
                </div>
            </div>
        </div>
    );
}
