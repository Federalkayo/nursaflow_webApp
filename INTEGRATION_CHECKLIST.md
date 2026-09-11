# NursaFlow Integration Checklist

This document details the exact files and integration points for connecting real production backends to **NursaFlow**.

## Integration Status Matrix

| Backend Service | Status | Integration Target Files | Key Setup Tasks |
| :--- | :--- | :--- | :--- |
| **Supabase Authentication** | Placeholder Ready | `src/services/supabase/authService.ts` | Replace mock auth with `supabase.auth.signUp()`, `signInWithPassword()`, `onAuthStateChange()` |
| **Supabase Database & Realtime** | Placeholder Ready | `src/services/supabase/dbService.ts` | Connect PostgreSQL tables (`profiles`, `quiz_questions`, `quiz_attempts`, `study_streaks`) and `supabase.channel()` |
| **Supabase Storage** | Placeholder Ready | `src/services/supabase/storageService.ts` | Replace object URLs with `supabase.storage.from('avatars').upload()` and `from('attachments').upload()` |
| **Paystack Subscriptions** | Edge Functions Ready | `src/services/paystack/paystackService.ts`, `supabase/functions/paystack-*` | Deploy Supabase Edge Functions (`paystack-initialize`, `paystack-verify`) and set `PAYSTACK_SECRET_KEY` |
| **Gemini AI Tutor** | Placeholder Ready | `src/services/gemini/geminiService.ts` | Connect `@google/genai` or cloud endpoint to `askNursingTutor()` |
| **ZEGOCLOUD Audio/Video** | Placeholder Ready | `src/services/zegocloud/callService.ts` | Initialize ZEGOCLOUD Call Kit token & WebRTC signaling |
| **ZEGOCLOUD Study Rooms** | Placeholder Ready | `src/services/zegocloud/roomService.ts` | Mount `ZegoUIKitPrebuilt` in DOM container node |

---

## 1. Supabase Backend Integration Guide

### Files to Modify / Deploy:
- `src/services/supabase/supabaseClient.ts`
- `src/services/supabase/authService.ts`
- `src/services/supabase/dbService.ts`
- `src/services/supabase/storageService.ts`
- `supabase/schema.sql`

### Action Steps:
1. Create a Supabase project in the [Supabase Dashboard](https://database.new/).
2. Copy your project URL and anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://<project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the SQL DDL migration in `supabase/schema.sql` via Supabase SQL Editor to create tables (`profiles`, `quiz_questions`, `quiz_attempts`, `study_streaks`, `subscriptions`) and enable Row Level Security (RLS).
4. Create public storage buckets `avatars` and `attachments` in Supabase Storage.

---

## 2. Paystack Subscription Integration Guide

### Files to Modify / Deploy:
- `src/services/paystack/paystackService.ts`
- `supabase/functions/paystack-initialize/index.ts`
- `supabase/functions/paystack-verify/index.ts`

### Action Steps:
1. Retrieve your Secret Key from the [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).
2. Set the secret key in Supabase Secrets:
   ```bash
   supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
   ```
3. Deploy Supabase Edge Functions:
   ```bash
   supabase functions deploy paystack-initialize
   supabase functions deploy paystack-verify
   ```
4. Query subscription status via `dbService.getSubscriptionStatus(userId)` and handle checkout redirects using `paystackService.initializeTransaction()`.

---

## 3. Gemini AI Integration Guide

### Files to Modify:
- `src/services/gemini/geminiService.ts`

### Action Steps:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Install GenAI SDK:
   ```bash
   npm install @google/genai
   ```
3. Replace `askNursingTutor()` in `geminiService.ts` to query `gemini-2.5-flash` or `gemini-2.5-pro`.
4. **Security Note**: Never hardcode `GEMINI_API_KEY` in client-side React code. Use Supabase Edge Functions or backend API proxy.

---

## 4. ZEGOCLOUD Real-Time Video & Audio Integration Guide

### Files to Modify:
- `src/services/zegocloud/roomService.ts`
- `src/services/zegocloud/callService.ts`

### Action Steps:
1. Register on [ZEGOCLOUD Admin Console](https://console.zegocloud.com/) and retrieve `appID` and `serverSecret`.
2. Install ZEGOCLOUD Web UIKit SDK:
   ```bash
   npm install @zegocloud/zego-uikit-prebuilt
   ```
3. Update `joinStudyRoom()` in `roomService.ts` to generate `kitToken` and render WebRTC video streams in the live room modal.

---

## Development & Build Commands

```bash
# Run local development server
npm run dev

# Run TypeScript compiler check
npm run lint

# Build production bundle
npm run build
```
