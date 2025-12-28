# Still Human Platform

A privacy-first anonymous story collection platform designed for high-risk environments where contributor safety is paramount.

## Features

- **Anonymous Story Submission**: No accounts, no emails, no personal data
- **Secure Access Codes**: One-time codes (hashed with Argon2id) for inbox and deletion
- **PII Redaction**: Automatic removal of emails, phone numbers, URLs, and social media handles
- **Lantern Pool**: Random assignment of supportive notes to prevent targeted harassment
- **Rate Limiting**: Prevents spam and brute force attacks
- **Quick Exit**: ESC key or button to instantly redirect to weather.com
- **Soft Sanctuary Design**: Supportive, gentle color palette and messaging

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Security**: Argon2id hashing, rate limiting, CSP headers
- **Styling**: Tailwind CSS with custom Soft Sanctuary palette

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account

### 2. Database Setup

1. Create a new Supabase project
2. Copy the SQL migration from `supabase/migrations/001_initial_schema.sql`
3. Run it in the Supabase SQL Editor

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase (already filled in)
NEXT_PUBLIC_SUPABASE_URL=https://unxgqujaqfdniocldegr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KaNGFvvwVdJUihcAisQETg_GyF_qp83
SUPABASE_SERVICE_ROLE_KEY=sb_secret_NlYWwFGs4X1U3CgqfvBBpw_Wam358R-

# Cloudflare Turnstile (optional for MVP)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here

# Redis (optional - using in-memory for MVP)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Admin
ADMIN_EMAILS=your_email@example.com
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

## Project Structure

```
still-human/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── stories/          # Story submission & deletion
│   │   ├── lantern-notes/    # Lantern Pool notes
│   │   └── inbox/           # Inbox lookup
│   ├── submit/              # Story submission form
│   ├── lantern/             # Lantern Pool page
│   ├── inbox/               # Inbox lookup page
│   ├── delete/              # Deletion page
│   └── page.tsx            # Home page
├── components/              # Reusable React components
│   ├── QuickExit.tsx       # Quick exit button
│   └── PIIWarning.tsx      # PII detection warnings
├── lib/                     # Core utilities
│   ├── codes.ts            # Code generation & hashing
│   ├── redaction.ts        # PII scrubbing
│   ├── contentFilter.ts    # Content safety filters
│   ├── rateLimit.ts        # Rate limiting
│   ├── supabase.ts         # Supabase clients
│   ├── instantComfort.ts   # Comfort message generator
│   └── types.ts            # TypeScript types
└── supabase/
    └── migrations/          # Database schema
```

## User Flows

### Submit a Story
1. Visit `/submit`
2. Fill out optional demographics and tags
3. Write story (PII warnings shown in real-time)
4. Choose privacy preferences
5. Submit → receive deletion code + inbox code (if opted in)
6. Codes shown ONCE on thank you page

### Leave a Lantern Note
1. Visit `/lantern`
2. Choose a template or write custom supportive message
3. Submit → note randomly assigned to eligible story
4. Note goes to moderation queue

### View Inbox
1. Visit `/inbox`
2. Enter inbox code
3. See approved Lantern Notes (if any)

### Delete Story
1. Visit `/delete`
2. Enter deletion code
3. Confirm by typing "DELETE"
4. Story soft-deleted, narrative wiped

## Security Features

- **No Personal Data**: Zero collection of emails, phones, names, or long-term IPs
- **Code Hashing**: All codes hashed with Argon2id (memory-hard)
- **Rate Limiting**: Prevents brute force and spam
- **Content Filtering**: Blocks contact info and harmful content in notes
- **CSP Headers**: Prevent script injection attacks
- **Constant-Time Verification**: Prevents timing attacks on codes
- **Soft Deletion**: Wipes narrative but keeps audit trail

## Rate Limits

- **Story Submission**: 3 per day per IP
- **Lantern Notes**: 10 per day per IP
- **Inbox Lookup**: 5 per 10 minutes per IP
- **Delete Story**: 3 per 10 minutes per IP

## Next Steps (TODO)

### Admin Console
- [ ] Admin authentication setup
- [ ] Story moderation queue
- [ ] Note moderation queue
- [ ] Research coding panel
- [ ] CSV export for analysis

### Enhancements
- [ ] Cloudflare Turnstile integration
- [ ] Redis for better rate limiting at scale
- [ ] Automated testing
- [ ] Public aggregate reports page

## Deployment

Recommended: Vercel + Supabase

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel
```

## License

This is a high-risk platform. Handle with care and prioritize user safety above all else.

## Support

If you find a security vulnerability, please report it immediately.
