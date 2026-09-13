import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TutorRequestBody {
  userQuestion?: string;
  conversationHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
  model?: string;
  ping?: boolean;
}

const SYSTEM_INSTRUCTION = `You are NursaFlow AI, an expert, empathetic, NCLEX-RN level nursing education tutor.
Your job is to provide accurate, evidence-based nursing logic, clinical rationales, and prioritization steps (e.g. ABCs, Maslow's, Nursing Process - ADPIE).
Always structure your answers clearly using clean Markdown (bold text, bullet points, headers, numbered lists).
Keep your tone encouraging, professional, and clear.
End your response with a JSON block at the very end formatted as:
\`\`\`json
{
  "suggestedFollowUps": ["Question 1", "Question 2", "Question 3"]
}
\`\`\`
If you cannot generate JSON at the end, just provide high-yield follow-up suggestions in text.`;

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Read secret exclusively from Supabase Server Secrets (never from client-side bundles)
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY secret is not configured in Supabase Edge Function environment.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: TutorRequestBody = await req.json().catch(() => ({}));

    // Server connection health check
    if (body.ping) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Supabase Edge Function connected securely with GROQ_API_KEY secret.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userQuestion, conversationHistory = [], model } = body;

    if (!userQuestion || !userQuestion.trim()) {
      return new Response(
        JSON.stringify({ error: 'userQuestion parameter is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
    ];

    const recent = conversationHistory.slice(-6);
    for (const msg of recent) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      });
    }

    messages.push({
      role: 'user',
      content: userQuestion,
    });

    const targetModel = model || Deno.env.get('GROQ_MODEL') || DEFAULT_MODEL;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      return new Response(
        JSON.stringify({ error: errData?.error?.message || `Groq API HTTP ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      return new Response(
        JSON.stringify({ error: 'Empty output from Groq model.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ answer: rawText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
