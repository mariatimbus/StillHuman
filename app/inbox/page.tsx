'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { LanternNote } from '@/lib/types';

export default function InboxPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [inboxCode, setInboxCode] = useState('');
    const [notes, setNotes] = useState<LanternNote[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [hasLooked, setHasLooked] = useState(false);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setHasLooked(false);

        try {
            const response = await fetch('/api/inbox/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inbox_code: inboxCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            setNotes(data.notes || []);
            setPendingCount(data.pending_count || 0);
            setHasLooked(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (hasLooked) {
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
                            Your Inbox
                        </h1>
                    </div>

                    {/* You're Not Alone Banner */}
                    <div className="gradient-header rounded-lg p-8 text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            You&apos;re Not Alone
                        </h2>
                        <p className="text-white opacity-90">
                            {notes.length === 0
                                ? 'No notes have been approved yet. Check back soon.'
                                : `${notes.length} ${notes.length === 1 ? 'person has' : 'people have'} sent you messages of support.`}
                        </p>
                    </div>

                    {/* Pending Notice */}
                    {pendingCount > 0 && (
                        <div className="bg-highlight border-l-4 border-accent rounded-lg p-4 mb-6">
                            <p className="text-text-primary text-sm">
                                <span className="font-semibold">{pendingCount}</span> {pendingCount === 1 ? 'note is' : 'notes are'} waiting for moderation approval.
                            </p>
                        </div>
                    )}

                    {/* Notes */}
                    {notes.length > 0 ? (
                        <div className="space-y-4 mb-8">
                            {notes.map((note) => (
                                <div key={note.id} className="bg-surface-white rounded-lg shadow-md p-6 border-l-4 border-accent">
                                    <p className="text-text-primary whitespace-pre-line mb-3">{note.note_text}</p>
                                    <p className="text-text-muted text-xs">
                                        Received {new Date(note.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-surface-white rounded-lg shadow-md p-8 text-center mb-8">
                            <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">No Notes Yet</h3>
                            <p className="text-text-secondary">
                                Your inbox is empty right now. Notes are reviewed before being delivered, so check back soon.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setHasLooked(false);
                                setInboxCode('');
                                setNotes([]);
                            }}
                            className="flex-1 bg-lavender-fog hover:bg-selection text-text-primary border border-border-soft font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Check Different Code
                        </button>
                        <Link href="/" className="flex-1">
                            <button className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                                Return Home
                            </button>
                        </Link>
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
                        View Your Inbox
                    </h1>
                    <p className="text-text-secondary">
                        Enter your inbox code to see supportive Lantern Notes sent to you.
                    </p>
                </div>

                {/* Info */}
                <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-bold text-text-primary mb-3">About Your Inbox Code</h2>
                    <ul className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>You received this code when you submitted your story (if you opted in for Lantern Notes).</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Notes are reviewed before being delivered, so there may be a delay.</span>
                        </li>
                        <li className="flex items-start">
                            <svg className="w-5 h-5 text-accent mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>You can check your inbox anytime using this code.</span>
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleLookup}>
                    <div className="bg-surface-white rounded-lg shadow-md p-6 mb-6">
                        <label className="block text-sm font-semibold text-text-primary mb-2">
                            Inbox Code <span className="text-error">*</span>
                        </label>
                        <p className="text-sm text-text-secondary mb-3">
                            Enter the inbox code you received when you submitted your story.
                        </p>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-border-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent font-mono mb-4"
                            placeholder="XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX"
                            value={inboxCode}
                            onChange={(e) => setInboxCode(e.target.value)}
                            minLength={20}
                        />

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || inboxCode.length < 20}
                            className="w-full bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Checking...' : 'View My Notes'}
                        </button>
                    </div>
                </form>

                {/* Privacy Note */}
                <div className="text-center text-text-muted text-sm">
                    <p>Your inbox code is never stored in plaintext. For security, attempts are rate-limited.</p>
                </div>
            </div>
        </div>
    );
}
