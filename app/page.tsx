'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Heart, MessageCircle, Send } from 'lucide-react';
import dynamic from 'next/dynamic';
import BlurText from '@/components/BlurText';

// Dynamically import Silk to avoid SSR issues with Three.js
const Silk = dynamic(() => import('@/components/Silk'), { ssr: false });

interface Story {
    id: string;
    narrative_redacted: string;
    created_at: string;
    context_tags?: string[];
    impact_tags?: string[];
    _isPending?: boolean;
}

// Post-it colors (soft, varied  palette)
const POST_IT_COLORS = [
    'rose',
    'lavender',
    'blush',
    'plum',
    'cream',
    'peach',
];

export default function HomePage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [commentsData, setCommentsData] = useState<Record<string, any[]>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
    const [replyingTo, setReplyingTo] = useState<Record<string, boolean>>({});
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [sendingReply, setSendingReply] = useState<Record<string, boolean>>({});
    const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});

    const toggleComments = async (id: string) => {
        const isExpanding = !expandedComments[id];

        setExpandedComments(prev => ({
            ...prev,
            [id]: isExpanding
        }));

        // Always fetch fresh comments when expanding (don't cache)
        if (isExpanding) {
            setLoadingComments(prev => ({ ...prev, [id]: true }));
            try {
                const res = await fetch(`/api/stories/${id}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(`[Frontend] Loaded ${data.comments?.length || 0} comments for story ${id}`);
                    setCommentsData(prev => ({ ...prev, [id]: data.comments }));
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoadingComments(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    const toggleStoryExpansion = (id: string) => {
        setExpandedStories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleReply = (id: string) => {
        const story = stories.find(s => s.id === id);
        if (story?._isPending) return; // Don't allow replying to pending stories
        setReplyingTo(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleReplyChange = (id: string, text: string) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    };

    const sendReply = async (id: string) => {
        const text = replyText[id];
        if (!text || text.trim().length < 10) {
            alert('Reply must be at least 10 characters long.');
            return;
        }

        setSendingReply(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch('/api/lantern-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note_text: text,
                    story_id: id,
                    note_type: 'responder'
                })
            });

            if (res.ok) {
                setReplyText(prev => ({ ...prev, [id]: '' }));
                setReplyingTo(prev => ({ ...prev, [id]: false }));

                // Clear cached comments - they'll refresh when user opens comments again
                setCommentsData(prev => {
                    const newData = { ...prev };
                    delete newData[id];
                    return newData;
                });

                // If comments are open, keep them open and refresh
                if (expandedComments[id]) {
                    setLoadingComments(prev => ({ ...prev, [id]: true }));
                    try {
                        const commentsRes = await fetch(`/api/stories/${id}/comments`);
                        if (commentsRes.ok) {
                            const data = await commentsRes.json();
                            console.log(`[Frontend] After reply: ${data.comments?.length || 0} comments`);
                            setCommentsData(prev => ({ ...prev, [id]: data.comments }));
                        }
                    } catch (err) {
                        console.error('Error refreshing comments:', err);
                    } finally {
                        setLoadingComments(prev => ({ ...prev, [id]: false }));
                    }
                }

                alert('Your reply has been sent!');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to send reply.');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setSendingReply(prev => ({ ...prev, [id]: false }));
        }
    };

    useEffect(() => {
        fetchStories();

        // Auto-refresh every 5 seconds to show new stories
        const interval = setInterval(() => {
            fetchStories();
        }, 5000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, []);

    const fetchStories = async () => {
        try {
            // Add timestamp to prevent browser caching
            const response = await fetch(`/api/stories/public?t=${Date.now()}`);
            const data = await response.json();

            let storiesList = data.stories || [];

            // Migrate old single pending_story to new array format (one-time migration)
            const oldPendingStory = localStorage.getItem('pending_story');
            if (oldPendingStory) {
                try {
                    const story = JSON.parse(oldPendingStory);
                    story._timestamp = Date.now();
                    const existing = localStorage.getItem('pending_stories');
                    const arr = existing ? JSON.parse(existing) : [];
                    arr.push(story);
                    localStorage.setItem('pending_stories', JSON.stringify(arr));
                    localStorage.removeItem('pending_story'); // Clean up old key
                } catch (e) {
                    localStorage.removeItem('pending_story');
                }
            }

            // Check for pending stories in localStorage (recently submitted)
            const pendingStoriesJson = localStorage.getItem('pending_stories');
            if (pendingStoriesJson) {
                try {
                    const pendingStories = JSON.parse(pendingStoriesJson);
                    const storiesToAdd = [];
                    const now = Date.now();

                    for (const story of pendingStories) {
                        // Check if this story is already in the API results
                        const exists = storiesList.some((s: any) =>
                            s.narrative_redacted === story.narrative_redacted ||
                            Math.abs(new Date(s.created_at).getTime() - new Date(story.created_at).getTime()) < 5000
                        );

                        if (exists) {
                            // Story is in API now, don't keep in localStorage
                            continue;
                        }

                        // If story is older than 60 seconds and NOT in API, it was likely rejected
                        const ageInMs = now - (story._timestamp || 0);
                        if (ageInMs > 60000) {
                            console.log('Removing old story from localStorage (likely rejected)');
                            continue;
                        }

                        // Story is recent and not yet in API - keep showing
                        story._isPending = true; // Mark as pending
                        storiesToAdd.push(story);
                    }

                    // Update localStorage with cleaned list
                    if (storiesToAdd.length > 0) {
                        localStorage.setItem('pending_stories', JSON.stringify(storiesToAdd));
                    } else {
                        localStorage.removeItem('pending_stories');
                    }

                    // Prepend pending stories to show them immediately
                    if (storiesToAdd.length > 0) {
                        storiesList = [...storiesToAdd, ...storiesList];
                    }
                } catch (e) {
                    console.error('Error parsing pending stories:', e);
                    localStorage.removeItem('pending_stories');
                }
            }

            setStories(storiesList);
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPostItColor = (index: number) => {
        return POST_IT_COLORS[index % POST_IT_COLORS.length] as any;
    };

    const truncateText = (text: string, maxLength: number = 180) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const getDisplayDate = (dateString: string, id: string) => {
        const date = new Date(dateString);
        const cutoffDate = new Date('2026-01-03');

        // If date is before Jan 3, 2026, randomize it to Aug-Dec 2025
        if (date < cutoffDate) {
            // Simple deterministic hash from ID
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
                hash = ((hash << 5) - hash) + id.charCodeAt(i);
                hash |= 0;
            }

            // Map hash to a month between 7 (August) and 11 (December)
            // Math.abs(hash) % 5 gives 0-4. + 7 gives 7-11.
            const randomMonth = (Math.abs(hash) % 5) + 7;

            // Set to 2025
            date.setFullYear(2025);
            date.setMonth(randomMonth);
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen w-full relative overflow-x-hidden">
            {/* Enhanced Multi-Layer Gradient Background with Patterns */}
            <div className="fixed inset-0 z-0">
                {/* Silk Shader Background - Animated fluid texture */}
                <div className="absolute inset-0 opacity-40">
                    <Silk
                        speed={3}
                        scale={1.2}
                        color="#E83C91"
                        noiseIntensity={1.2}
                        rotation={0.1}
                    />
                </div>

                {/* Base gradient layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-cream via-light-pink/30 to-cream" />

                {/* Geometric grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(232, 60, 145, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(232, 60, 145, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px'
                }} />

                {/* Diagonal stripes pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(232, 60, 145, 0.1) 35px, rgba(232, 60, 145, 0.1) 70px)'
                }} />

                {/* Animated overlay gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-tr from-hot-pink/20 via-transparent to-light-pink/20 animate-gradient-xy" />
                <div className="absolute inset-0 bg-gradient-to-bl from-light-pink/15 via-transparent to-dark-plum/10 animate-gradient-xy-delayed" />

                {/* Enhanced Floating Orbs with better colors */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-hot-pink/20 to-light-pink/20 blur-[120px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-light-pink/20 to-dark-plum/15 blur-[140px] animate-float-delayed" />
                <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-hot-pink/15 to-light-pink/15 blur-[100px] animate-float-slow" />
                <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-gradient-to-bl from-light-pink/10 to-cream/20 blur-[90px] animate-float" />

                {/* Floating sparkle particles for liveliness */}
                <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-hot-pink/60 animate-float" />
                <div className="absolute top-[60%] left-[15%] w-3 h-3 rounded-full bg-light-pink/50 animate-float-delayed" />
                <div className="absolute top-[30%] right-[25%] w-2 h-2 rounded-full bg-hot-pink/60 animate-float-slow" />
                <div className="absolute top-[75%] right-[30%] w-3 h-3 rounded-full bg-light-pink/50 animate-float" />
                <div className="absolute top-[45%] left-[40%] w-2 h-2 rounded-full bg-dark-plum/60 animate-float-delayed" />
                <div className="absolute top-[85%] left-[70%] w-2 h-2 rounded-full bg-hot-pink/50 animate-float-slow" />
                <div className="absolute top-[10%] right-[15%] w-3 h-3 rounded-full bg-light-pink/60 animate-float" />

                {/* Subtle noise texture overlay for depth */}
                <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")'
                }} />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10">
                {/* Navigation */}
                <nav className="w-full px-6 py-6">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 hover:scale-110 transition-transform duration-200 p-2">
                                <img src="/invisible-borders-logo.png" alt="Invisible Borders" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-serif text-3xl font-bold text-black tracking-wide hover:text-hot-pink transition-colors duration-200 uppercase">
                                Invisible Borders
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/submit">
                                <GlassButton variant="primary" size="sm">
                                    Share Story
                                </GlassButton>
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-12 pb-20 px-6 relative">
                    {/* Decorative geometric shapes */}
                    <div className="absolute top-10 left-10 w-20 h-20 border-2 border-hot-pink/20 rounded-lg rotate-12 animate-float-slow" />
                    <div className="absolute top-40 right-20 w-16 h-16 border-2 border-light-pink/20 rounded-full animate-float-delayed" />
                    <div className="absolute bottom-10 left-1/4 w-12 h-12 border-2 border-dark-plum/20 rotate-45 animate-float" />

                    <div className="max-w-5xl mx-auto text-center relative">
                        {/* Decorative accent line top */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full" />


                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-8 animate-fade-in-up shadow-[0_4px_12px_rgba(232,60,145,0.1)]">
                            <span className="text-sm font-medium text-black">
                                A safe space for your story
                            </span>
                        </div>

                        <div className="relative mb-6">
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-hot-pink/40 via-light-pink/40 to-hot-pink/40 rounded-full" />
                            <BlurText
                                text="Your experiences matter."
                                delay={100}
                                animateBy="words"
                                direction="top"
                                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight drop-shadow-sm mb-2 text-center justify-center"
                            />
                            <BlurText
                                text="You matter."
                                delay={120}
                                animateBy="words"
                                direction="top"
                                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-hot-pink leading-tight drop-shadow-sm text-center justify-center"
                            />
                        </div>

                        <p className="text-lg md:text-xl text-black/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            Share your story anonymously. Receive support from others. You are not alone.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/submit">
                                <button className="px-8 py-4 text-lg font-semibold bg-hot-pink text-white rounded-full shadow-[0_8px_24px_rgba(232,60,145,0.4)] hover:shadow-[0_12px_32px_rgba(232,60,145,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-hot-pink hover:border-light-pink w-full sm:w-auto">
                                    Share Your Story
                                </button>
                            </Link>
                            <Link href="/lantern">
                                <button className="px-8 py-4 text-lg font-semibold bg-hot-pink text-white rounded-full shadow-[0_8px_24px_rgba(232,60,145,0.4)] hover:shadow-[0_12px_32px_rgba(232,60,145,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-hot-pink hover:border-light-pink w-full sm:w-auto">
                                    Leave a Lantern Note
                                </button>
                            </Link>
                        </div>

                        {/* Decorative accent line bottom */}

                    </div>
                </section>

                {/* Decorative Section Divider */}
                <div className="w-full flex items-center justify-center px-6 py-8">
                    <div className="flex items-center gap-4 max-w-4xl w-full">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-purple-600" />
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse-slow" />
                            <div className="w-2 h-2 rounded-full bg-pink-600 animate-pulse-slow" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse-slow" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-purple-400 to-purple-600" />
                    </div>
                </div>

                {/* Quick Action Cards */}
                <section className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Link href="/inbox">
                                <GlassCard hoverEffect className="p-8 group">
                                    <div className="text-4xl mb-4">📬</div>
                                    <h3 className="font-serif text-2xl font-bold text-black mb-3">
                                        View Your Inbox
                                    </h3>
                                    <p className="text-black/80 leading-relaxed">
                                        Check for supportive Lantern Notes from the community
                                    </p>
                                </GlassCard>
                            </Link>

                            <Link href="/lantern">
                                <GlassCard hoverEffect variant="highlight" className="p-8 group md:-mt-6">
                                    <div className="text-4xl mb-4">🏮</div>
                                    <h3 className="font-serif text-2xl font-bold text-black mb-3">
                                        Light a Lantern
                                    </h3>
                                    <p className="text-black/80 leading-relaxed">
                                        Send an anonymous note of support to someone who shared
                                    </p>
                                </GlassCard>
                            </Link>

                            <Link href="/delete">
                                <GlassCard hoverEffect className="p-8 group">
                                    <div className="text-4xl mb-4">🔒</div>
                                    <h3 className="font-serif text-2xl font-bold text-black mb-3">
                                        Delete Story
                                    </h3>
                                    <p className="text-black/80 leading-relaxed">
                                        Permanently remove your story using your deletion code
                                    </p>
                                </GlassCard>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Decorative Section Divider */}
                <div className="w-full flex items-center justify-center px-6 py-8">
                    <div className="flex items-center gap-4 max-w-4xl w-full">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-blue-600" />
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse-slow" />
                            <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse-slow" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 rounded-full bg-pink-600 animate-pulse-slow" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-blue-400 to-blue-600" />
                    </div>
                </div>

                {/* Community Stories Section */}
                <section className="py-16 px-6 relative">
                    {/* Decorative background shapes */}
                    <div className="absolute top-20 right-10 w-24 h-24 border border-rose-300/10 rounded-full animate-float-delayed" />
                    <div className="absolute bottom-20 left-10 w-16 h-16 border border-purple-300/10 rounded-lg rotate-12 animate-float" />

                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 relative">
                            {/* Top accent line */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-hot-pink/30 to-transparent rounded-full" />

                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-black mb-3 relative inline-block">
                                Community Stories
                                {/* Decorative underline */}
                                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-hot-pink/20 via-light-pink/30 to-hot-pink/20 rounded-full" />
                            </h2>
                            <p className="text-lg text-black/80 font-light mt-4">
                                Real stories. Real support. Real human connection.
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-20">
                                <div className="spinner w-16 h-16 mx-auto mb-6"></div>
                                <p className="text-slate-700 text-lg font-medium animate-pulse-slow">
                                    Loading heartfelt stories...
                                </p>
                            </div>
                        ) : stories.length === 0 ? (
                            <div className="text-center py-20">
                                <GlassCard className="p-12 max-w-2xl mx-auto">
                                    <div className="text-6xl mb-6 animate-float">💙</div>
                                    <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                                        No Stories Yet
                                    </h3>
                                    <p className="text-slate-700 text-lg mb-8 leading-relaxed">
                                        Be the first to share your story and help others feel less alone.
                                    </p>
                                    <Link href="/submit">
                                        <GlassButton size="lg">
                                            Share Your Story
                                        </GlassButton>
                                    </Link>
                                </GlassCard>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {stories.map((story, index) => (
                                    <GlassCard
                                        key={story.id}
                                        hoverEffect
                                        variant={getPostItColor(index)}
                                        className={`p-8 stagger-item flex flex-col`}
                                        style={{
                                            height: '480px', // Fixed height for perfect alignment
                                            transform: `rotate(${(index % 3) - 1}deg)`,
                                        }}
                                    >
                                        {/* Tags */}
                                        {story.context_tags && story.context_tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {story.context_tags.slice(0, 3).map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-sm font-bold bg-white text-black px-4 py-1.5 rounded-full shadow-md border border-slate-200"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Story text - takes up available space */}
                                        <div className={`flex-grow ${expandedStories[story.id] ? 'overflow-y-auto max-h-60 pr-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent' : 'overflow-hidden'}`}>
                                            <p className="text-lg text-black leading-relaxed font-serif">
                                                {expandedStories[story.id]
                                                    ? story.narrative_redacted
                                                    : truncateText(story.narrative_redacted)}
                                            </p>
                                            {story.narrative_redacted.length > 180 && (
                                                <button
                                                    onClick={() => toggleStoryExpansion(story.id)}
                                                    className="mt-2 text-sm font-medium text-black hover:text-hot-pink underline transition-colors"
                                                >
                                                    {expandedStories[story.id] ? 'See less' : 'Read more'}
                                                </button>
                                            )}
                                        </div>

                                        {/* Comments & Reply sections */}
                                        {expandedComments[story.id] && (
                                            <div className="mt-4 pt-3 border-t border-black/5 animate-fade-in">
                                                {loadingComments[story.id] ? (
                                                    <div className="text-center py-4 text-black text-xs">Loading comments...</div>
                                                ) : commentsData[story.id] && commentsData[story.id].length > 0 ? (
                                                    <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                                                        {commentsData[story.id].map((comment: any) => (
                                                            <div key={comment.id} className="text-sm bg-white/30 p-2.5 rounded-lg">
                                                                <span className="font-bold text-black block text-xs mb-1">
                                                                    {comment.note_type === 'responder' ? 'Supporter' : 'Community'}
                                                                </span>
                                                                <p className="text-slate-700 text-xs leading-relaxed">{comment.note_text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-black text-xs italic">
                                                        No comments yet. Be the first to share some love!
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {replyingTo[story.id] && (
                                            <div className="mt-3 flex gap-2 animate-fade-in">
                                                <input
                                                    type="text"
                                                    value={replyText[story.id] || ''}
                                                    onChange={(e) => handleReplyChange(story.id, e.target.value)}
                                                    placeholder="Write a supportive reply (min 10 chars)..."
                                                    className="flex-1 bg-white/40 border border-white/30 placeholder:text-black text-black rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-400 focus:bg-white/60 transition-all"
                                                    disabled={sendingReply[story.id]}
                                                />
                                                <button
                                                    onClick={() => sendReply(story.id)}
                                                    disabled={sendingReply[story.id]}
                                                    className="bg-black text-white p-1.5 rounded-full hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                                                >
                                                    {sendingReply[story.id] ? (
                                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Send size={14} />
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Date & Actions Bar - Always at bottom */}
                                        <div className="mt-auto pt-4 border-t border-black/5">
                                            <div className="h-10 flex items-center justify-between">
                                                <div className="flex items-center gap-4">

                                                    <button
                                                        onClick={() => toggleComments(story.id)}
                                                        className="text-black hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-white/20 flex items-center gap-1.5"
                                                    >
                                                        <MessageCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleReply(story.id)}
                                                        disabled={story._isPending}
                                                        className={`text-black hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-white/20 ${story._isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Send size={20} />
                                                    </button>
                                                </div>

                                                <div className="text-xs text-black italic font-medium whitespace-nowrap">
                                                    {getDisplayDate(story.created_at, story.id)}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                </section>



                {/* Footer */}
                <footer className="py-12 px-6 border-t border-white/20 bg-white/5 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="font-serif text-xl font-bold text-black">
                                Invisible Borders
                            </span>
                        </div>
                        <div className="text-black text-sm">
                            © 2025 Invisible Borders. Your stories are shared with care.
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
