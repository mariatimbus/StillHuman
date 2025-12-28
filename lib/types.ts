/**
 * TypeScript type definitions for database schema
 */

export type StoryStatus = 'pending' | 'approved' | 'rejected' | 'held' | 'deleted';
export type NoteStatus = 'pending' | 'approved' | 'rejected';
export type NoteType = 'public' | 'responder';

export interface Story {
    id: string;
    created_at: string;
    updated_at: string;
    status: StoryStatus;
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
    narrative_redacted: string;
    deletion_code_hash: string;
    inbox_code_hash?: string;
    notes_count_approved: number;
    deleted_at?: string;
}

export interface LanternNote {
    id: string;
    story_id: string;
    created_at: string;
    updated_at: string;
    status: NoteStatus;
    note_type: NoteType;
    note_text: string;
    moderation_reason?: string;
}

export interface CodesCatalog {
    code: string;
    category: string;
    definition: string;
    created_at: string;
}

export interface StoryCode {
    story_id: string;
    code: string;
    severity?: number;
    modifiers?: string[];
    created_at: string;
}

export interface AuditLog {
    id: string;
    created_at: string;
    admin_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details?: Record<string, any>;
}

// Form submission types
export interface StorySubmission {
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
    narrative: string; // Will be redacted before storage
}

export interface LanternNoteSubmission {
    note_text: string;
    note_type?: NoteType;
}

// API response types
export interface StorySubmissionResponse {
    success: boolean;
    deletion_code: string;
    inbox_code?: string;
    warnings?: string[];
    comfort_message?: {
        title: string;
        message: string;
        resources?: string[];
    };
}

export interface InboxResponse {
    success: boolean;
    notes: LanternNote[];
    pending_count: number;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
}

// Tag options (for form dropdowns)
export const TAG_OPTIONS = {
    identity: [
        'LGBTQ+',
        'Person with disability',
        'Person of color',
        'Religious minority',
        'Gender minority',
        'Neurodivergent',
        'Other marginalized identity',
    ],
    context: [
        'School',
        'Family',
        'Healthcare',
        'Workplace',
        'Online',
        'Public space',
        'Religious institution',
        'Sports/recreation',
        'Other',
    ],
    power: [
        'Peer',
        'Authority figure',
        'Stranger',
        'Family member',
        'Teacher/educator',
        'Healthcare provider',
        'Employer/supervisor',
        'Other',
    ],
    impact: [
        'Emotional/psychological',
        'Academic',
        'Physical health',
        'Social relationships',
        'Career/work',
        'Financial',
        'Safety/security',
        'Other',
    ],
    risk: [
        'Ongoing situation',
        'Blackmail/coercion',
        'Physical danger',
        'Fear of retaliation',
        'Involves minors',
        'Other safety concern',
    ],
} as const;

export const AREA_TYPES = ['Urban', 'Suburban', 'Rural', 'Remote'] as const;
export const AGE_RANGES = ['13-15', '16-18', '19-24', '25-34', '35-44', '45+'] as const;
