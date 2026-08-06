# Microsoft Student Community (MSC) - SRM University AP

[![CI Pipeline](https://github.com/YUVRAJ-SINGH-3178/Microsoft-Student-Community-/actions/workflows/ci.yml/badge.svg)](https://github.com/YUVRAJ-SINGH-3178/Microsoft-Student-Community-/actions/workflows/ci.yml)

The official Next.js App Router application for the Microsoft Student Community at SRM University AP. This platform powers the main website, event registrations, gallery, team management, and the internal Admin dashboard.

## Tech Stack
- **Framework:** Next.js 14+ (App Router, Server Components)
- **Database/Auth:** Supabase (PostgreSQL, Row Level Security)
- **Styling:** CSS Modules / Vanilla CSS (Dark mode, glassmorphism design system)
- **Rate Limiting:** Upstash Redis
- **Deploy:** Vercel (Recommended)

## Setup Instructions

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd msc-srmap
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Configuration
Copy the `.env.example` file to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`
Fill in the Supabase URL, Anon Key, and Service Role Key from your Supabase dashboard.

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Build for Production
\`\`\`bash
npm run build
npm start
\`\`\`

## Key Features
- **Role-Based Access Control:** Protects `/admin` and `/dashboard` using Supabase Auth and `member_profiles.role`.
- **Event Portal:** Dedicated dashboard for students participating in ongoing hackathons.
- **Dynamic Telemetry:** Real-time stats powered by Supabase aggregation.
- **Global Error Handling:** Custom `error.tsx` and `not-found.tsx` to prevent hard crashes.

## License
Proprietary - Microsoft Student Community — SRM University AP.
