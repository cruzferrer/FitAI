import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// MODIFICACIÓN 1: Usa la clave del deno.json
import { createClient } from "@supabase/supabase-js"; 
// MODIFICACIÓN 2: Usa la clave del deno.json
import OpenAI from "openai"; 

// ... el resto del código es el mismo ...
// ... la lógica de la Edge Function ...

// ----------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN
// ----------------------------------------------------

const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); 

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY no está configurada en Supabase Secrets.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-ada-002"; 
const GPT_MODEL = "gpt-4-turbo-preview"; 

// ----------------------------------------------------
// 2. FUNCIÓN DE BÚSQUEDA (RAG)
// ----------------------------------------------------

/** Busca los documentos de conocimiento más relevantes usando pgvector. */
async function searchKnowledge(supabaseClient: any, query: string, match_count: number = 5) {
    // Generar el vector (embedding) de la pregunta del usuario
    const embeddingResponse = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: query,
    });
    const userEmbedding = embeddingResponse.data[0].embedding;

    // Buscar en la BD usando la extensión pgvector (Función match_documents)
    const { data, error } = await supabaseClient.rpc('match_documents', {
        query_embedding: userEmbedding,
        match_count: match_count,
    });

    if (error) throw new Error("Error al buscar en pgvector: " + error.message);
    
    // Retorna el contenido de los documentos encontrados
    return data.map((d: any) => d.contenido).join('\n---\n');
}

// ----------------------------------------------------
// 3. HANDLER PRINCIPAL DE LA FUNCIÓN
// ----------------------------------------------------

serve(async (req) => {
    try {
        const { user_objective, user_experience, available_days } = await req.json();

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            SUPABASE_SERVICE_KEY ?? ''
        );

        // A. CONSTRUCCIÓN DE LA BASE DE CONOCIMIENTO (RAG)
        const knowledgeQuery = `${user_objective} training principles for a ${user_experience} athlete, ${available_days} days a week.`;
        const scientificKnowledge = await searchKnowledge(supabaseClient, knowledgeQuery);

        // B. CONSTRUCCIÓN DEL CATÁLOGO DE EJERCICIOS
        const { data: exerciseData, error: dbError } = await supabaseClient
            .from('ejercicios')
            .select('name, targetMuscles, bodyParts, equipments')
            .limit(50); 

        if (dbError) throw new Error("Error al obtener ejercicios: " + dbError.message);
        
        const exerciseList = JSON.stringify(exerciseData);


        // C. CREACIÓN DEL SUPER-PROMPT (Generación de JSON)
        const prompt = `
            ROL: Eres "FitAI Coach", un experto en periodización.
            TAREA: Genera un mesociclo de 6 semanas periodizado con progresión semanal.

            **REGLAS Y PRINCIPIOS CIENTÍFICOS (DEBES SEGUIR ESTO ESTRICTAMENTE):**
            ${scientificKnowledge}

            **PERFIL DEL USUARIO:**
            - Objetivo Principal: ${user_objective}
            - Nivel de Experiencia: ${user_experience}
            - Días de Entrenamiento: ${available_days}
            - Periodización: 3 semanas de acumulación/intensificación y 1 semana de descarga, repitiendo el ciclo.

            **CATÁLOGO DE EJERCICIOS PERMITIDOS:**
            - Utiliza ejercicios SOLAMENTE de esta lista JSON: ${exerciseList}

            **FORMATO DE SALIDA OBLIGATORIO:**
            Tu respuesta debe ser SOLAMENTE un objeto JSON válido que siga el esquema 'rutina_periodizada':
            {
              "rutina_periodizada": [
                {
                  "semana": 1,
                  "fase": "Acumulación - Volumen Base",
                  "dias": [
                    {
                      "dia_entrenamiento": "Día 1 - Upper A",
                      "grupos": [
                        {
                          "grupo_muscular": "Pecho (Básico)",
                          "ejercicios": [
                            {
                              "nombre": "Press Banca",
                              "series": "3",
                              "repeticiones": "5",
                              "carga_notacion": "RPE 7",
                              "nota": "..."
                            }
                          ]
                        }
                      ]
                    }
                    // ... Días restantes
                  ]
                }
                // ... Semanas 2, 3, 4, 5, 6
              ]
            }
        `;

        // D. GENERACIÓN DE LA RESPUESTA (LLM)
        const response = await openai.chat.completions.create({
            model: GPT_MODEL,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }, 
        });

        const jsonOutput = response.choices[0].message.content;
        
        return new Response(jsonOutput, {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error("Fallo de la Edge Function:", e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});