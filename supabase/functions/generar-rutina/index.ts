// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from "@supabase/supabase-js";
// @deno-types="https://esm.sh/openai@4.47.1/index.d.ts"
import OpenAI from "openai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("Función 'generar-rutina' iniciada (v4 - Reglas Ultra Estrictas).");

// ----------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN
// ----------------------------------------------------

const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

if (!OPENAI_API_KEY) {
  console.error(
    "Error Crítico: OPENAI_API_KEY no está configurada en Supabase Secrets."
  );
  throw new Error("OPENAI_API_KEY no está configurada.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-ada-002";
const GPT_MODEL = "gpt-4-turbo-preview";

// ----------------------------------------------------
// 2. FUNCIÓN DE BÚSQUEDA (RAG)
// ----------------------------------------------------

async function searchKnowledge(
  supabaseClient: any,
  query: string,
  match_count: number = 5
) {
  console.log("Generando embedding para RAG...");
  const embeddingResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const userEmbedding = embeddingResponse.data[0].embedding;

  console.log("Buscando en pgvector (match_documents)...");
  const { data, error } = await supabaseClient.rpc("match_documents", {
    match_count: match_count,
    query_embedding: userEmbedding,
  });

  if (error) throw new Error("Error al buscar en pgvector: " + error.message);

  if (!Array.isArray(data)) {
    throw new Error(
      "La búsqueda de conocimiento (RAG) falló, no devolvió un array."
    );
  }

  console.log(`Conocimiento RAG encontrado (${data.length} fragmentos).`);
  return data.map((d: any) => d.contenido).join("\n---\n");
}

// ----------------------------------------------------
// 3. HANDLER PRINCIPAL DE LA FUNCIÓN
// ----------------------------------------------------

serve(async (req) => {
  try {
    console.log("Edge Function invocada.");
    const {
      user_objective,
      user_experience,
      available_days,
      user_equipment,
      user_notation,
      generation_preference,
      preferred_exercises,
      injuries,
      time_per_session,
      comfort_preference,
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      SUPABASE_SERVICE_KEY ?? ""
    );

    const knowledgeQuery = `${user_objective} training principles for a ${user_experience} athlete, ${available_days} days a week.`;
    const scientificKnowledge = await searchKnowledge(
      supabaseClient,
      knowledgeQuery
    );

    let exercisesKnowledge = "";
    try {
      exercisesKnowledge = await searchKnowledge(
        supabaseClient,
        "mejores ejercicios tier list prioridad ejercicios Tier S A alternativas cómodas",
        5
      );
    } catch (err) {
      console.warn(
        "No se pudo obtener conocimiento específico de 'mejores ejercicios':",
        err?.message ?? err
      );
      exercisesKnowledge = "";
    }

    console.log("Obteniendo catálogo de ejercicios...");
    const { data: exerciseData, error: dbError } = await supabaseClient
      .from("ejercicios")
      .select("name, targetMuscles, bodyParts, equipments, gifUrl, gif_url")
      .limit(200);

    if (dbError)
      throw new Error("Error al obtener ejercicios: " + dbError.message);

    const normalizeName = (n: string | null | undefined) =>
      (n ?? "").trim().toLowerCase();

    const gifMap = new Map(
      (exerciseData || []).map((e: any) => [e.name, e.gifUrl || e.gif_url])
    );
    const gifMapNormalized = new Map(
      (exerciseData || []).map((e: any) => [
        normalizeName(e.name),
        e.gifUrl || e.gif_url,
      ])
    );

    const getGifForExercise = (name: string | null | undefined) => {
      if (!name) return null;
      const direct = gifMap.get(name);
      if (direct) return direct;
      const norm = normalizeName(name);
      return gifMapNormalized.get(norm) ?? null;
    };

    const exerciseList = JSON.stringify(exerciseData);
    console.log("Creando prompt optimizado...");

    // Construir variables sin interpolaciones dentro del template literal
    const generationMode = generation_preference ?? "Generado por IA";
    const userPreferredExercises =
      preferred_exercises ?? "Ninguno especificado";
    const userInjuries = injuries ?? "Ninguna";
    const userTimePerSession = time_per_session ?? "No especificado";
    const userComfortPreference = comfort_preference ?? "Priorizar comodidad";

    const prompt = `Eres "FitAI Coach", un experto en periodización deportiva y ciencias del ejercicio.

Tu tarea es generar un mesociclo de 6 semanas con progresión semanal para el siguiente perfil:

═══════════════════════════════════════════════════════════════════
PERFIL DEL USUARIO
═══════════════════════════════════════════════════════════════════
• Objetivo: ${user_objective}
• Experiencia: ${user_experience}
• Días disponibles: ${available_days} días por semana
• Equipamiento: ${user_equipment}
• Notación preferida: ${user_notation}
• Preferencia de generación: ${generationMode}
• Ejercicios preferidos: ${userPreferredExercises}
• Lesiones/limitaciones: ${userInjuries}
• Tiempo por sesión: ${userTimePerSession} minutos
• Preferencia de comodidad: ${userComfortPreference}

═══════════════════════════════════════════════════════════════════
REGLAS CRÍTICAS (OBLIGATORIO CUMPLIR AL 100%)
═══════════════════════════════════════════════════════════════════

🔴 REGLA #1 - DÍAS EXACTOS (LA MÁS IMPORTANTE):
El array "dias" de la Semana 1 DEBE contener EXACTAMENTE ${available_days} elementos.
• Si ${available_days} = 2 → genera 2 días (ej: Full Body A, Full Body B)
• Si ${available_days} = 3 → genera 3 días (ej: Push, Pull, Legs)
• Si ${available_days} = 4 → genera 4 días (ej: Upper, Lower, Upper, Lower)
• Si ${available_days} = 5 → genera 5 días (ej: Push, Pull, Legs, Upper, Lower)
• Si ${available_days} = 6 → genera 6 días (ej: Push, Pull, Legs, Push, Pull, Legs)

NO generes 3 días si el usuario pidió 6. NO generes 4 si pidió 5. EXACTAMENTE ${available_days} elementos.

🔴 REGLA #2 - EJERCICIOS TIER S/A PRIORITARIOS:
Usa SIEMPRE estos ejercicios como base (están en Tier S/A científicamente):
• Pecho: Bench Press (Barbell), Dumbbell Chest Press, Incline Bench Press
• Espalda: Barbell Row, Pull-ups, Lat Pulldown, Seated Cable Row
• Piernas: Barbell Squat, Romanian Deadlift, Bulgarian Split Squat, Leg Press
• Hombros: Overhead Press (Barbell o Dumbbell), Lateral Raises
• Brazos: Barbell Curl, Triceps Dips, Rope Pushdowns

Si el usuario tiene lesiones o pide "comodidad", usa alternativas con máquinas (ej: Chest Press Machine en lugar de Bench Press).

🔴 REGLA #3 - VOLUMEN REALISTA:
• Hipertrofia: 3-5 series por ejercicio, 8-15 repeticiones
• Fuerza: 3-6 series por ejercicio, 3-6 repeticiones
• Mixto: 3-5 series, 6-12 repeticiones
• Total por grupo muscular: 10-20 series SEMANALES (suma de todos los ejercicios)

🔴 REGLA #4 - NOTACIÓN CORRECTA:
• Si user_notation = "RPE / RIR (Moderno)" → usa "RPE 7", "RPE 8", "RIR 2", etc.
• Si user_notation = "Tradicional (Al Fallo)" → usa "Peso moderado", "Peso pesado", "Al fallo"

🔴 REGLA #5 - VARIEDAD EN CADA DÍA:
Cada día debe tener 2-3 ejercicios por grupo muscular grande (pecho, espalda, piernas).
Ejemplo Día Push: Press Banca (compuesto) + Incline Dumbbell Press (compuesto) + Cable Flyes (aislamiento).

🔴 REGLA #6 - USAR SOLO EJERCICIOS DEL CATÁLOGO:
Todos los nombres de ejercicios deben estar EXACTAMENTE como aparecen en el catálogo JSON. Si un ejercicio ideal no existe, busca el más similar en el catálogo.

═══════════════════════════════════════════════════════════════════
CONOCIMIENTO CIENTÍFICO (APLICAR ESTOS PRINCIPIOS)
═══════════════════════════════════════════════════════════════════
${scientificKnowledge}

═══════════════════════════════════════════════════════════════════
TIER LIST DE MEJORES EJERCICIOS (USAR ESTOS PRIMERO)
═══════════════════════════════════════════════════════════════════
${exercisesKnowledge}

═══════════════════════════════════════════════════════════════════
CATÁLOGO DE EJERCICIOS DISPONIBLES
═══════════════════════════════════════════════════════════════════
${exerciseList}

═══════════════════════════════════════════════════════════════════
FORMATO DE SALIDA (JSON ESTRICTO)
═══════════════════════════════════════════════════════════════════
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura:

{
  "rutina_periodizada": [
    {
      "semana": 1,
      "fase": "Acumulación - Volumen Base",
      "dias": [
        {
          "dia_entrenamiento": "Día 1 - Push (Pecho/Hombro/Tríceps)",
          "grupos": [
            {
              "grupo_muscular": "Pecho (Compuesto)",
              "ejercicios": [
                {
                  "nombre": "Bench Press (Barbell)",
                  "series": "4",
                  "repeticiones": "8-10",
                  "carga_notacion": "RPE 7",
                  "nota": "Ejercicio base de empuje"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "semana": 2,
      "fase": "Intensificación - RPE 8",
      "dias": "Mismo patrón que Semana 1, incrementar RPE a 8"
    }
  ]
}

✅ VALIDACIÓN FINAL ANTES DE RESPONDER:
1. ¿El array "dias" de Semana 1 tiene EXACTAMENTE ${available_days} elementos? Si no, CORRIGE.
2. ¿Usaste ejercicios Tier S/A como Bench Press, Squat, Barbell Row? Si no, CORRIGE.
3. ¿Las series son 3-5 por ejercicio? Si no, CORRIGE.
4. ¿La notación es ${user_notation}? Si no, CORRIGE.

Genera el JSON ahora:`;

    console.log("Llamando a la API de OpenAI...");

    const response = await openai.chat.completions.create({
      model: GPT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Eres un generador de JSON. RESPONDE SOLO JSON válido sin explicaciones adicionales.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    console.log("Respuesta de OpenAI recibida. Validando JSON...");
    const jsonOutput = response.choices[0].message.content;

    try {
      if (!jsonOutput || typeof jsonOutput !== "string") {
        throw new Error("La respuesta de OpenAI no es un string JSON válido.");
      }
      const parsed = JSON.parse(jsonOutput);

      if (parsed && Array.isArray(parsed.rutina_periodizada)) {
        const baseWeeks = parsed.rutina_periodizada;

        console.log(
          `GIF Map initialized with ${gifMap.size} entries (normalized: ${gifMapNormalized.size})`
        );

        const applyGifUrls = (weeks: any[]) => {
          const missing: string[] = [];
          let matched = 0;
          let total = 0;

          weeks.forEach((w: any) => {
            if (!w || !Array.isArray(w.dias)) return;
            w.dias.forEach((d: any) => {
              if (!d || !Array.isArray(d.grupos)) return;
              d.grupos.forEach((g: any) => {
                if (!g || !Array.isArray(g.ejercicios)) return;
                g.ejercicios.forEach((ej: any) => {
                  if (!ej) return;
                  total++;
                  if (!ej.gif_url || !ej.gif_url.trim()) {
                    const gif = getGifForExercise(ej.nombre);
                    if (gif) {
                      ej.gif_url = gif;
                      ej.gifUrl = gif;
                      matched++;
                      console.log(
                        `✅ GIF matched: "${ej.nombre}" → ${gif.substring(0, 50)}...`
                      );
                    } else {
                      missing.push(ej.nombre ?? "(sin nombre)");
                      ej.gif_url = null;
                      ej.gifUrl = null;
                      console.warn(`❌ GIF NOT found for: "${ej.nombre}"`);
                    }
                  }
                });
              });
            });
          });

          if (missing.length > 0) {
            console.warn(
              `⚠️ Ejercicios sin GIF (${missing.length}/${total}): ${missing
                .slice(0, 5)
                .join(", ")} ${missing.length > 5 ? `... (+${missing.length - 5} más)` : ""}`
            );
          } else {
            console.log(
              `✅ Todos los ejercicios (${total}) tienen GIF asignado`
            );
          }
          console.log(
            `📊 GIF Assignment Summary: ${matched}/${total} matched`
          );
        };

        // VALIDACIÓN POST-GENERACIÓN: verificar que Semana 1 tenga el número correcto de días
        if (baseWeeks[0] && Array.isArray(baseWeeks[0].dias)) {
          const generatedDays = baseWeeks[0].dias.length;
          if (generatedDays !== available_days) {
            console.warn(
              `⚠️ ADVERTENCIA: Se generaron ${generatedDays} días pero el usuario pidió ${available_days}`
            );
          } else {
            console.log(
              `✅ Validación correcta: ${generatedDays} días generados`
            );
          }
        }

        const baseWeek0Dias = Array.isArray(baseWeeks[0]?.dias)
          ? baseWeeks[0].dias
          : [];

        const expandWeekFromBase = (desc: any) => {
          try {
            const description =
              typeof desc === "string" ? desc.toLowerCase() : "";
            const cloned = baseWeek0Dias.map((d: any) =>
              JSON.parse(JSON.stringify(d))
            );

            let targetRPE: string | null = null;
            if (description.includes("rpe 9") || description.includes("rpe9"))
              targetRPE = "RPE 9";
            else if (
              description.includes("rpe 8") ||
              description.includes("rpe8")
            )
              targetRPE = "RPE 8";
            else if (
              description.includes("rpe 6") ||
              description.includes("rpe6")
            )
              targetRPE = "RPE 6";

            const shouldIncSeries =
              description.includes("+1") ||
              description.includes("incremento") ||
              description.includes("añadiendo 1") ||
              description.includes("añadir 1") ||
              description.includes("1 serie");
            const shouldReduceToTwoThree =
              description.includes("2-3") ||
              description.includes("2 a 3") ||
              description.includes("reducc") ||
              description.includes("reducción") ||
              description.includes("reduccion");

            cloned.forEach((day: any) => {
              if (!Array.isArray(day.grupos)) return;
              day.grupos.forEach((grupo: any) => {
                if (!Array.isArray(grupo.ejercicios)) return;
                grupo.ejercicios.forEach((ej: any) => {
                  if (targetRPE) ej.carga_notacion = targetRPE;

                  if (shouldIncSeries && typeof ej.series === "string") {
                    const m = ej.series.match(/^\s*(\d+)\s*$/);
                    if (m) {
                      const num = parseInt(m[1], 10);
                      ej.series = String(num + 1);
                    } else {
                      const range = ej.series.match(/^(\d+)\s*-\s*(\d+)$/);
                      if (range) {
                        const a = parseInt(range[1], 10);
                        const b = parseInt(range[2], 10);
                        ej.series = `${a + 1}-${b + 1}`;
                      }
                    }
                  }

                  if (shouldReduceToTwoThree) {
                    ej.series = "2-3";
                  }
                });
              });
            });

            return cloned;
          } catch (e) {
            console.warn("Error expanding week descriptor:", e);
            return [];
          }
        };

        parsed.rutina_periodizada = parsed.rutina_periodizada.map((w: any) => {
          const copy = { ...w };
          if (copy && copy.dias) {
            if (Array.isArray(copy.dias)) return copy;
            if (typeof copy.dias === "string") {
              copy.dias = expandWeekFromBase(copy.dias);
              return copy;
            }
          }
          copy.dias = [];
          return copy;
        });

        applyGifUrls(parsed.rutina_periodizada);

        const repaired = JSON.stringify(parsed);
        console.log("JSON reparado y listo para devolver.");
        return new Response(repaired, {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (e: any) {
      console.warn("No se pudo parsear la salida de OpenAI o repararla:", e);
    }

    return new Response(
      jsonOutput ?? JSON.stringify({ error: "Respuesta vacía de OpenAI" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (e: any) {
    console.error("Fallo de la Edge Function:", e?.message ?? String(e));
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
