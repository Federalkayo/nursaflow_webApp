import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TutorRequestBody {
  userQuestion: string;
  conversationHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
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

const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('VITE_GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not configured on server.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userQuestion, conversationHistory = [] }: TutorRequestBody = await req.json();

    if (!userQuestion || !userQuestion.trim()) {
      return new Response(
        JSON.stringify({ error: 'userQuestion parameter is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    const recent = conversationHistory.slice(-6);
    for (const msg of recent) {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userQuestion }],
    });

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    };

    let lastError = '';

    for (const model of GEMINI_MODELS) {
      try {
        const isAq = apiKey.startsWith('AQ');
        const url = isAq
          ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
          : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        };
        if (isAq) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return new Response(
              JSON.stringify({ answer: rawText }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          const errData = await res.json().catch(() => null);
          lastError = errData?.error?.message || res.statusText;
        }
      } catch (err: any) {
        lastError = err.message || 'Fetch error';
      }
    }

    return new Response(
      JSON.stringify({ error: `Gemini API Call Failed: ${lastError}` }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
