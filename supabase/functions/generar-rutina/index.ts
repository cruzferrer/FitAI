// @deno-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from "@supabase/supabase-js";
// @deno-types="https://esm.sh/openai@4.47.1/index.d.ts"
import OpenAI from "openai";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("Función 'generar-rutina' iniciada (v3 - Reglas Estrictas).");

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
const GPT_MODEL = "gpt-4-turbo-preview"; // o 'gpt-3.5-turbo' si el 4 falla

// ----------------------------------------------------
// 2. FUNCIÓN DE BÚSQUEDA (RAG)
// ----------------------------------------------------

async function searchKnowledge(
  supabaseClient: any,
  query: string,
  match_count: number = 5
) {
  console.log("Paso 2.A: Generando embedding para RAG...");
  const embeddingResponse = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });
  const userEmbedding = embeddingResponse.data[0].embedding;

  console.log("Paso 2.B: Buscando en pgvector (match_documents)...");
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

  console.log(
    `Paso 2.C: Conocimiento RAG encontrado (${data.length} fragmentos).`
  );
  return data.map((d: any) => d.contenido).join("\n---\n");
}

// ----------------------------------------------------
// 3. HANDLER PRINCIPAL DE LA FUNCIÓN
// ----------------------------------------------------

serve(async (req) => {
  try {
    console.log("Paso 1: Edge Function invocada.");
    // --- ACEPTAR LAS VARIABLES ENVIADAS POR EL FRONT ---
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

    // Adicional: buscar contenido específico sobre "mejores ejercicios" (Tier List)
    let exercisesKnowledge = "";
    try {
      exercisesKnowledge = await searchKnowledge(
        supabaseClient,
        "mejores ejercicios tier list prioridad ejercicios Tier S A alternativas cómodas",
        5
      );
    } catch (err) {
      console.warn("No se pudo obtener conocimiento específico de 'mejores ejercicios':", err?.message ?? err);
      exercisesKnowledge = "";
    }

    console.log("Paso 3.A: Obteniendo catálogo de ejercicios...");
    const { data: exerciseData, error: dbError } = await supabaseClient
      .from("ejercicios")
      .select("name, targetMuscles, bodyParts, equipments")
      .limit(50);

    if (dbError)
      throw new Error("Error al obtener ejercicios: " + dbError.message);

    const exerciseList = JSON.stringify(exerciseData);
    console.log("Paso 3.B: Creando Super-Prompt...");

    // --- PROMPT MEJORADO CON LAS NUEVAS REGLAS (P1, P2, P3, P4) ---
    const prompt = `
            ROL: Eres "FitAI Coach", un experto en periodización.
            TAREA: Genera un mesociclo de 6 semanas periodizado con progresión semanal.

            **PERFIL DEL USUARIO:**
            - Objetivo Principal: ${user_objective}
            - Nivel de Experiencia: ${user_experience}
            - Días de Entrenamiento: ${available_days}
            - Equipamiento: ${user_equipment}
            - Preferencia de Notación: ${user_notation}
            - Preferencia de Generación: ${generation_preference ?? "Generado por IA"}
            - Ejercicios preferidos (si indican): ${preferred_exercises ?? "Ninguno especificado"}
            - Lesiones / Limitaciones: ${injuries ?? "Ninguna"}
            - Tiempo objetivo por sesión: ${time_per_session ?? "No especificado"} min
            - Preferencia de comodidad: ${comfort_preference ?? "Priorizar comodidad"}

            **REGLAS DE GENERACIÓN (OBLIGATORIAS - DEBES CUMPLIRLAS):**
            1.  **REGLA DE DÍAS (CRÍTICA):** DEBES generar un plan para *exactamente* el número de \`${available_days}\` días. Si \`${available_days}\` es 6, un split PPL (Push/Pull/Legs) x2 es apropiado. Si son 4, un Upper/Lower x2 es apropiado. Si son 5, un split PPL + Upper/Lower es apropiado.
            2.  **REGLA DE VOLUMEN (SERIES):** Tus "series" en el JSON deben ser realistas para un solo ejercicio (ej. 3-5 series). NO generes solo 1 serie por ejercicio. El volumen total (ej. 10-20 series) se refiere a *SERIES POR SEMANA* por grupo muscular.
            3.  **REGLA DE REPETICIONES:** Basa las repeticiones en el objetivo. Hipertrofia (6-15 reps), Fuerza (1-5 reps). NO uses 20-25 reps para hipertrofia a menos que sea un aislamiento específico.
            4.  **REGLA DE NOTACIÓN:** Basa la "carga_notacion" en la preferencia del usuario.
                - Si la preferencia es 'RPE / RIR (Moderno)', usa notación RPE o RIR (ej. "RPE 8" o "RIR 2").
                - Si la preferencia es 'Tradicional (Al Fallo)', describe la intensidad (ej. "Peso pesado", "Peso moderado", o "Al fallo").
            
            5.  **REGLA DE VARIEDAD DE EJERCICIOS (¡NUEVA!):** Para cada grupo muscular principal (ej. "Pecho", "Espalda", "Piernas") en un día, DEBES incluir al menos dos (2) ejercicios diferentes del catálogo. Por ejemplo, para "Pecho", puedes incluir "Press Banca" (compuesto) y "Aperturas en Peck Deck" (aislamiento). No incluyas solo un ejercicio por grupo muscular.

            6.  **PRIORIDAD DE EJERCICIOS (OBLIGATORIA):** Prioriza ejercicios listados en la Tier List científica (Tier S/A) del conocimiento interno (mejores_ejercicios). Si el usuario pide "comodidad" o tiene limitaciones, selecciona las alternativas "cómodas" indicadas. Cuando incluyas pecho, por defecto usa `Bench Press` / `Chest Press` (barra o mancuerna segun equipo) como ejercicio principal, salvo que el usuario indique lo contrario.

            7.  **CATÁLOGO Y CONCORDANCIA:** Selecciona ejercicios SOLO del catálogo JSON provisto (campo `CATÁLOGO DE EJERCICIOS PERMITIDOS`). Si un ejercicio recomendado no existe en el catálogo, elige la alternativa más similar disponible.

            **PRINCIPIOS CIENTÍFICOS (DEBES SEGUIR ESTO ESTRICTAMENTE):**
            ${scientificKnowledge}

            **CONOCIMIENTO SOBRE MEJORES EJERCICIOS (TIER LIST):**
            ${exercisesKnowledge}

            **CATÁLOGO DE EJERCICIOS PERMITIDOS:**
            - Utiliza ejercicios SOLAMENTE de esta lista JSON: ${exerciseList}

            **FORMATO DE SALIDA OBLIGATORIO (JSON - MUY IMPORTANTE):**
            Tu respuesta debe ser SOLAMENTE un objeto JSON válido.
            La clave raíz DEBE ser "rutina_periodizada".
            "rutina_periodizada" DEBE ser un ARRAY de objetos de Semana, UNO POR CADA SEMANA DEL MESOCICLO.
            CADA objeto de Semana (de 1 a 6) DEBE contener un array de "dias" que detalle los ejercicios para esa semana.
            NO mezcles estructuras; no pongas "ajustes" en lugar de "dias" en las semanas 2-6. Genera el plan completo.

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
                          "grupo_muscular": "Pecho (Básico)",
                          "ejercicios": [
                            {
                              "nombre": "Press Banca",
                              "series": "4",
                              "repeticiones": "8-10",
                              "carga_notacion": "RPE 7",
                              "nota": "..."
                            }
                  _       ]
                        }
                      ]
                    }
                  ]
                }
              ]
      _       }
        `; // <-- FIN DEL PROMPT

    console.log(
      "Paso 4: Llamando a la API de OpenAI (chat.completions.create)..."
    );

    // Use a deterministic generation and a system message that enforces strict JSON-only output
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

    console.log(
      "Paso 5: Respuesta de OpenAI recibida. Validando y reparando JSON si es necesario."
    );
    const jsonOutput = response.choices[0].message.content;

    // Intentamos parsear la salida y asegurar que todas las semanas tengan `dias` como array.
    try {
      if (!jsonOutput || typeof jsonOutput !== "string") {
        throw new Error("La respuesta de OpenAI no es un string JSON válido.");
      }
      const parsed = JSON.parse(jsonOutput);

      if (parsed && Array.isArray(parsed.rutina_periodizada)) {
        const baseWeeks = parsed.rutina_periodizada;
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

            // Detect RPE change
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

        parsed.rutina_periodizada = parsed.rutina_periodizada.map(
          (w: any, idx: number) => {
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
          }
        );

        const repaired = JSON.stringify(parsed);
        console.log("Paso 5.B: JSON reparado y listo para devolver.");
        return new Response(repaired, {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }
    } catch (e: any) {
      console.warn("No se pudo parsear la salida de OpenAI o repararla:", e);
      // Caerá a devolver el output original abajo
    }

    // Si no pudimos parsear o no había rutina_periodizada, devolvemos el contenido original
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
}); // <-- CORRECCIÓN: ESTA ES LA LÍNEA FINAL. EL PARÉNTESIS EXTRA (`)`) SE HA ELIMINADO.
