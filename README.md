# Microsoft Student Community (MSC) - SRM University AP

[![CI Pipeline](https://github.com/YUVRAJ-SINGH-3178/Microsoft-Student-Community-/actions/workflows/ci.yml/badge.svg)](https://github.com/YUVRAJ-SINGH-3178/Microsoft-Student-Community-/actions/workflows/ci.yml)

The official web platform for the Microsoft Student Community at SRM University AP. Built to manage event registrations, payment processing, team matchmaking, and the internal admin dashboard.

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Razorpay
- **Rate Limiting:** Upstash Redis
- **Deploy & Cron:** Vercel

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Copy `.env.example` to `.env.local` and populate the required keys for Supabase, Razorpay, and Upstash.

3. **Database Configuration**
   Apply the SQL migrations from `supabase/migrations/` via the Supabase SQL Editor to initialize tables, functions (RPCs), and RLS policies.

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Core Features
- **Event Registrations:** Database-level row locking and capacity checks to prevent overselling.
- **Payments:** Secure Razorpay integration for paid events with webhook-driven state confirmation.
- **Automated Workflows:** Vercel Cron jobs for expiring abandoned payment reservations and database keepalives.
- **Admin Dashboard:** Role-based access control (RBAC) protecting internal community management tools.

## Contributors

<a href="https://github.com/microsoft-student-community/Microsoft-Student-Community-/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=microsoft-student-community/Microsoft-Student-Community-" />
</a>

## License
Proprietary - Microsoft Student Community — SRM University AP.
