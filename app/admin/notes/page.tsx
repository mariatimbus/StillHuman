'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note {
    id: string;
    note_text: string;
    note_type: string;
    created_at: string;
    status: string;
    story_id: string;
}

export default function NotesModerationPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

    useEffect(() => {
        fetchNotes();
    }, [filter]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/notes?status=${filter}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            const response = await fetch(`/api/admin/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');
            fetchNotes();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update note status');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-1">
                        Lantern Notes Moderation
                    </h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow mb-6 p-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'pending'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'approved'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            All
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <p className="text-gray-600">No notes found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notes.map((note) => (
                            <div key={note.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(note.status)}`}>
                                            {note.status}
                                        </span>
                                        <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {note.note_type}
                                        </span>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {new Date(note.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{note.note_text}</p>

                                {note.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleModerate(note.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleModerate(note.id, 'rejected')}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
