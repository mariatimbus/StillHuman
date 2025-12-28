'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ThankYouPage() {
    const router = useRouter();
    const [submissionData, setSubmissionData] = useState<any>(null);
    const [copiedDeletion, setCopiedDeletion] = useState(false);
    const [copiedInbox, setCopiedInbox] = useState(false);
    const hasLoaded = useRef(false);

    useEffect(() => {
        // Prevent double execution in React StrictMode
        if (hasLoaded.current) {
            console.log('Already loaded, skipping...');
            return;
        }

        const loadData = () => {
            console.log('Loading submission data...');

            // Try sessionStorage first
            let data = sessionStorage.getItem('submission_data');
            console.log('SessionStorage data:', data ? 'found' : 'not found');

            // If not in sessionStorage, try URL hash
            if (!data && window.location.hash) {
                try {
                    const hash = window.location.hash.substring(1); // Remove #
                    console.log('Hash length:', hash.length);
                    data = atob(hash); // Decode base64
                    console.log('Loaded data from URL hash');
                } catch (e) {
                    console.error('Failed to decode hash:', e);
                }
            }

            if (data) {
                console.log('Parsing data...');
                hasLoaded.current = true; // Mark as loaded
                setSubmissionData(JSON.parse(data));
                // Clear after retrieving (one-time view)
                sessionStorage.removeItem('submission_data');
                // Clear hash from URL
                window.history.replaceState(null, '', '/submit/thank-you');
            } else {
                // Wait a bit longer before redirecting (give time for hash to load)
                console.log('No data found yet, waiting...');
                setTimeout(() => {
                    if (!hasLoaded.current) {
                        console.log('Still no data, redirecting to home');
                        router.push('/');
                    }
                }, 1000);
            }
        };

        // Small delay to ensure hash is available
        setTimeout(loadData, 100);
    }, [router]);

    const copyToClipboard = (text: string, type: 'deletion' | 'inbox') => {
        navigator.clipboard.writeText(text);
        if (type === 'deletion') {
            setCopiedDeletion(true);
            setTimeout(() => setCopiedDeletion(false), 2000);
        } else {
            setCopiedInbox(true);
            setTimeout(() => setCopiedInbox(false), 2000);
        }
    };

    if (!submissionData) {
        return (
            <div className="min-h-screen bg-powder-blush flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-powder-blush py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-success rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                        Thank You for Sharing
                    </h1>
                    <p className="text-text-secondary">
                        Your story has been received. You are brave. You are believed.
                    </p>
                </div>

                {/* Comfort Message */}
                {submissionData.comfort_message && (
                    <div className="comfort-message mb-8">
                        <h2 className="text-xl font-bold text-text-primary mb-3">
                            {submissionData.comfort_message.title}
                        </h2>
                        <div className="text-text-secondary whitespace-pre-line mb-4">
                            {submissionData.comfort_message.message}
                        </div>
                        {submissionData.comfort_message.resources && (
                            <ul className="list-disc list-inside text-text-secondary text-sm space-y-1">
                                {submissionData.comfort_message.resources.map((resource: string, i: number) => (
                                    <li key={i}>{resource}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Critical - Save These Codes */}
                <div className="bg-warning bg-opacity-10 border-l-4 border-warning rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center">
                        <svg className="w-6 h-6 text-warning mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        IMPORTANT: Save These Codes NOW
                    </h3>
                    <p className="text-text-primary mb-4 font-semibold">
                        These codes are shown ONLY ONCE and cannot be recovered. Save them in a safe place.
                    </p>

                    {/* Deletion Code */}
                    <div className="bg-surface-white rounded-lg p-4 mb-4">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Deletion Code
                        </label>
                        <p className="text-xs text-text-secondary mb-2">
                            Use this to permanently delete your story at any time
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={submissionData.deletion_code}
                                className="flex-1 px-4 py-2 bg-lavender-fog border border-border-soft rounded-lg font-mono text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(submissionData.deletion_code, 'deletion')}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors"
                            >
                                {copiedDeletion ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Inbox Code */}
                    {submissionData.inbox_code && (
                        <div className="bg-surface-white rounded-lg p-4">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Inbox Code
                            </label>
                            <p className="text-xs text-text-secondary mb-2">
                                Use this to view supportive Lantern Notes sent to you
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={submissionData.inbox_code}
                                    className="flex-1 px-4 py-2 bg-lavender-fog border border-border-soft rounded-lg font-mono text-sm"
                                />
                                <button
                                    onClick={() => copyToClipboard(submissionData.inbox_code, 'inbox')}
                                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white rounded-lg font-semibold transition-colors"
                                >
                                    {copiedInbox ? '✓ Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Redaction Warnings */}
                {submissionData.warnings && submissionData.warnings.length > 0 && (
                    <div className="bg-highlight border-l-4 border-warning rounded-lg p-4 mb-8">
                        <h3 className="font-semibold text-text-primary mb-2">Privacy Notice</h3>
                        <ul className="text-sm text-text-secondary space-y-1">
                            {submissionData.warnings.map((warning: string, i: number) => (
                                <li key={i}>• {warning}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-surface-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-bold text-text-primary mb-4">What Happens Next?</h3>
                    <ol className="space-y-3 text-text-secondary">
                        <li className="flex items-start">
                            <span className="font-bold text-primary mr-3">1.</span>
                            <span>Your story will be reviewed by our team to ensure your privacy is protected.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-bold text-primary mr-3">2.</span>
                            <span>Once approved, it will contribute to research and help us understand harassment better.</span>
                        </li>
                        {submissionData.inbox_code && (
                            <li className="flex items-start">
                                <span className="font-bold text-primary mr-3">3.</span>
                                <span>Check your inbox with your inbox code to see supportive Lantern Notes from others.</span>
                            </li>
                        )}
                        <li className="flex items-start">
                            <span className="font-bold text-primary mr-3">{submissionData.inbox_code ? '4' : '3'}.</span>
                            <span>You can delete your story at any time using your deletion code.</span>
                        </li>
                    </ol>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Link href="/" className="flex-1">
                        <button className="w-full bg-lavender-fog hover:bg-selection text-text-primary font-semibold py-3 px-6 rounded-lg border border-border-soft transition-colors">
                            Return Home
                        </button>
                    </Link>
                    {submissionData.inbox_code && (
                        <Link href="/inbox" className="flex-1">
                            <button className="w-full bg-secondary hover:bg-secondary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                                View Your Inbox
                            </button>
                        </Link>
                    )}
                </div>

                {/* Final Message */}
                <div className="text-center text-text-muted text-sm">
                    <p>You deserve safety. You deserve support. You are not alone.</p>
                </div>
            </div>
        </div>
    );
}
