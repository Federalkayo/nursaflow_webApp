# Fixing "Couldn't reach live Groq AI (Failed to send a request to the Edge Function)"

## Root cause
`supabase.functions.invoke('groq-tutor')` in `groqService.ts` is correct, and
`supabase/functions/groq-tutor/index.ts` is correct. But **the function code
being present in the git repo does not deploy it**. There is no
`supabase/config.toml` in this project, which means this repo has never been
linked to a Supabase project via the CLI, and `groq-tutor` has never actually
been pushed to Supabase's servers. The browser's request to
`https://<project>.supabase.co/functions/v1/groq-tutor` fails before it ever
reaches your function, which is exactly the
`FunctionsFetchError: Failed to send a request to the Edge Function` message
you're seeing.

This patch adds the missing `supabase/config.toml` so the project can be
linked, plus npm scripts to link/deploy/set secrets. You still need to run
these commands yourself (they require your Supabase login):

## One-time setup

```bash
# 1. Install the Supabase CLI if you don't have it
npm install -g supabase

# 2. Log in (opens a browser)
supabase login

# 3. Link this repo to your Supabase project
#    (project ref is already set in supabase/config.toml — confirm it
#    matches the subdomain in your VITE_SUPABASE_URL)
npm run supabase:link

# 4. Set the Groq API key as a server-side secret (never in .env/VITE_*)
supabase secrets set GROQ_API_KEY=your-real-groq-key-here

# 5. Deploy the function
npm run deploy:groq-tutor
```

## Verify it worked

```bash
curl -X POST \
  "https://dnwozxhtbgbkpdvknajh.supabase.co/functions/v1/groq-tutor" \
  -H "Authorization: Bearer <your VITE_SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"ping": true}'
```

You should get back:
```json
{"status":"ok","message":"Supabase Edge Function connected securely with GROQ_API_KEY secret."}
```

If you get a 404, the deploy step didn't succeed — check `supabase functions list`.
If you get a 500 with `GROQ_API_KEY secret is not configured`, step 4 didn't take —
re-run `supabase secrets set` and redeploy.

Then reload `/ai-tutor` in the app and ask a real question — the "Couldn't
reach live Groq AI" banner should be gone.

## Cleanup (optional)
`supabase/functions/gemini-tutor/index.ts` is dead code left over from the
Gemini migration — nothing in the client calls it anymore. Either delete it
or leave it undeployed; it costs nothing sitting in git as long as it's not
linked to a route you rely on.
