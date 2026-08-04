# Refreshed By Faith — Sober Living Housing

Starter web application built from scratch for refreshedbyfaith.com.

## Included
- Premium responsive public website
- Admissions flow modeled on common recovery-housing patterns: learn/find fit → application → review/interview → approval → move-in
- Supabase email/password authentication
- Applicant dashboard with saveable intake draft
- Required $35 Stripe Checkout application fee before submission
- Stripe webhook changes paid applications to `submitted`
- Supabase schema for houses, beds, applications, payments, reviews, admissions, staff and audit events
- RLS so applicants can access their own application while staff access is role-gated

## Setup
1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and add your keys.
4. In Stripe, create a webhook endpoint at `https://refreshedbyfaith.com/api/stripe-webhook` listening for `checkout.session.completed`; add its signing secret to Vercel.
5. `npm install`
6. `npm run build`
7. Deploy to Vercel and point refreshedbyfaith.com to the deployment.

## Important launch work
This is a technical starter, not a compliance determination. Before collecting real applicant data, have the intake questions, privacy notice, fee/refund disclosure, housing criteria, consent language, retention policy and staff access model reviewed for the laws and certification/licensing rules that apply to the homes' location and business model. Avoid collecting information that is not necessary for housing/admissions.

## v1.4 authentication + payment fix
The applicant dashboard now restores the Supabase session with `auth.getSession()`, listens for auth changes, redirects expired sessions to sign-in, prevents payment without certification, and displays server payment configuration errors.

For Stripe checkout, Vercel must also contain these **server-only** environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `STRIPE_SECRET_KEY`. The webhook additionally requires `STRIPE_WEBHOOK_SECRET`. Never prefix the service-role or Stripe secret with `VITE_`.
