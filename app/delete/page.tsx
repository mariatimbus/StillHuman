'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DeletePage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deletionCode, setDeletionCode] = useState('');
    const [confirmInput, setConfirmInput] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleFinalDelete = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/stories/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deletion_code: deletionCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
            setShowConfirm(false);
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
                            Your Story Has Been Deleted
                        </h2>
                        <p className="text-text-secondary mb-6">
                            Your story and any associated notes have been permanently removed from our system. Thank you for using this platform.
                        </p>
                        <Link href="/">
                            <button className="px-8 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold transition-colors">
                                Return Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (showConfirm) {
        return (
            <div className="min-h-screen bg-powder-blush py-8">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Confirmation Dialog */}
                    <div className="bg-surface-white rounded-lg shadow-md p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-error rounded-full mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-text-primary text-center mb-3">
                            Are You Sure?
                        </h2>
                        <p className="text-text-secondary text-center mb-6">
                            This action cannot be undone. Your story and all associated notes will be permanently deleted.
                        </p>

                        <div className="bg-error bg-opacity-10 border-l-4 border-error rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-error mb-2">This will permanently:</h3>
                            <ul className="text-sm text-text-primary space-y-1">
                                <li>• Delete your story from our database</li>
                                <li>• Remove all Lantern Notes sent to you</li>
                                <li>• Make your deletion and inbox codes unusable</li>
                                <li>• Cannot be reversed or recovered</li>
                            </ul>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Type &quot;DELETE&quot; to confirm
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-error"
                                placeholder="DELETE"
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowConfirm(false);
                                    setConfirmInput('');
                                }}
                                className="flex-1 bg-lavender-fog hover:bg-selection text-text-primary border border-border-soft font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalDelete}
                                disabled={loading || confirmInput !== 'DELETE'}
                                className="flex-1 bg-error hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-powder-blush py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="text-primary hover:text-primary-hover text-sm font-semibold flex items-center mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                        Delete Your Story
                    </h1>
                    <p className="text-text-secondary">
                        You have the right to remove your story at any time. Use your deletion code below.
                    </p>
                </div>

                {/* Info */}
                <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3">About Deletion</h2>
                    <ul className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Your deletion code was provided when you submitted your story.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Deletion is permanent and cannot be undone.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>All associated Lantern Notes will also be removed.</span>
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleInitialSubmit}>
                    <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Deletion Code <span className="text-error">*</span>
                        </label>
                        <p className="text-sm text-text-secondary mb-3">
                            Enter your deletion code to proceed. You&apos;ll be asked to confirm before deletion.
                        </p>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-error font-mono mb-4"
                            placeholder="XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX"
                            value={deletionCode}
                            onChange={(e) => setDeletionCode(e.target.value)}
                            minLength={20}
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={deletionCode.length < 20}
                            className="w-full bg-error hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue to Confirmation
                        </button>
                    </div>
                </form>

                {/* Privacy Note */}
                <div className="bg-highlight border-l-4 border-warning rounded-lg p-4">
                    <p className="text-text-primary text-sm">
                        <span className="font-semibold">Privacy Note:</span> Your deletion code is verified securely. For security, attempts are rate-limited.
                    </p>
                </div>
            </div>
        </div>
    );
}
