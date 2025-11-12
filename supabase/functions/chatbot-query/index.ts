// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from "@supabase/supabase-js";
// @deno-types="https://esm.sh/openai@4.47.1/index.d.ts"
import OpenAI from "openai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("Función 'chatbot-query' iniciada (v1).");

// ----------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN
// ----------------------------------------------------

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!OPENAI_API_KEY) {
  console.error(
    "Error Crítico: OPENAI_API_KEY no está configurada en Supabase Secrets."
  );
  throw new Error("OPENAI_API_KEY no está configurada.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const GPT_MODEL = "gpt-3.5-turbo"; // Usamos 3.5-turbo para un chat rápido y económico

// ----------------------------------------------------
// 2. HANDLER PRINCIPAL DE LA FUNCIÓN
// ----------------------------------------------------

serve(async (req: any) => {
  try {
    console.log("Chatbot: Invocada.");
    // Obtenemos el 'user_prompt' que definiste en el hook 'useChat.ts'
    const { user_prompt } = await req.json();

    if (!user_prompt) {
      throw new Error("No se recibió 'user_prompt'.");
    }

    console.log(`Chatbot: Recibido prompt: "${user_prompt}"`);

    // --- Definimos el "Rol" de la IA ---
    const systemPrompt = `
            Eres "FitAI Coach", un asistente de fitness experto.
            Tu propósito es responder preguntas sobre entrenamiento, nutrición y biomecánica.
            Sé conciso, amigable y preciso. Si te preguntan sobre una rutina específica, 
            explica que puedes dar consejos generales de entrenamiento.
        `;

    // --- Llamada a OpenAI ---
    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: user_prompt },
      ],
    });

    const botResponseText = response.choices[0].message.content;

    // --- Devolvemos la respuesta en el formato que el hook espera ---
    return new Response(JSON.stringify({ response: botResponseText }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    console.error("Fallo de la Edge Function (Chatbot):", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
