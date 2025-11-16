/**
 * Script de prueba: Simula el avance de progreso (advanceProgress) en varios escenarios.
 *
 * Propósito: Verificar que la lógica de transición de día/semana funciona correctamente
 * antes de desplegar cambios a producción.
 *
 * Uso (en terminal dentro del proyecto):
 *   npx ts-node scripts/test-progress-advancement.ts
 *
 * O si prefieres Node.js puro, convierte a .js y ejecuta:
 *   node scripts/test-progress-advancement.js
 */

// Tipos para la rutina (debe coincidir con el hook)
interface DiaEntrenamiento {
  dia_entrenamiento: string;
  grupos?: any[];
}

interface Semana {
  semana: number;
  fase: string;
  dias: DiaEntrenamiento[];
}

interface RutinaGenerada {
  rutina_periodizada: Semana[];
}

interface Progress {
  weekIndex: number;
  dayIndex: number;
  lastCompleted: string | null;
}

/**
 * Simula la lógica de advanceProgress sin dependencias externas
 */
function simulateAdvanceProgress(
  currentProgress: Progress,
  routine: RutinaGenerada
): Progress | null {
  try {
    const semanas = routine.rutina_periodizada || [];
    const currentWeekIndex = Math.max(0, currentProgress.weekIndex || 0);
    const currentDayIndex = Math.max(0, currentProgress.dayIndex || 0);

    if (!Array.isArray(semanas) || semanas.length === 0) {
      console.warn("Rutina sin semanas válidas");
      return null;
    }

    const curWeek = semanas[currentWeekIndex] || semanas[0];
    const daysInWeek =
      curWeek && Array.isArray(curWeek.dias) ? curWeek.dias.length : 0;

    let nextWeekIndex = currentWeekIndex;
    let nextDayIndex = currentDayIndex + 1;

    if (nextDayIndex >= daysInWeek) {
      nextDayIndex = 0;
      nextWeekIndex = Math.min(
        currentWeekIndex + 1,
        Math.max(0, semanas.length - 1)
      );
    }

    return {
      weekIndex: nextWeekIndex,
      dayIndex: nextDayIndex,
      lastCompleted: new Date().toISOString().split("T")[0],
    };
  } catch (e) {
    console.error("Error en advanceProgress:", e);
    return null;
  }
}

/**
 * Mock routine: 4 weeks, variable days each
 */
const mockRoutine: RutinaGenerada = {
  rutina_periodizada: [
    {
      semana: 1,
      fase: "Acondicionamiento",
      dias: [
        { dia_entrenamiento: "Día 1 - Upper A" },
        { dia_entrenamiento: "Día 2 - Lower A" },
        { dia_entrenamiento: "Día 3 - Upper B" },
        { dia_entrenamiento: "Día 4 - Lower B" },
      ],
    },
    {
      semana: 2,
      fase: "Fuerza",
      dias: [
        { dia_entrenamiento: "Día 1 - Upper A" },
        { dia_entrenamiento: "Día 2 - Lower A" },
        { dia_entrenamiento: "Día 3 - Upper B" },
        { dia_entrenamiento: "Día 4 - Lower B" },
      ],
    },
    {
      semana: 3,
      fase: "Hipertrofia",
      dias: [
        { dia_entrenamiento: "Día 1 - Upper A" },
        { dia_entrenamiento: "Día 2 - Lower A" },
        { dia_entrenamiento: "Día 3 - Upper B" },
      ],
    },
    {
      semana: 4,
      fase: "Deload",
      dias: [
        { dia_entrenamiento: "Día 1 - Deload" },
        { dia_entrenamiento: "Día 2 - Deload" },
      ],
    },
  ],
};

// Test Cases
const testCases = [
  {
    name: "Caso 1: Primer día (Semana 0, Día 0) → Avanza a Día 1",
    input: { weekIndex: 0, dayIndex: 0, lastCompleted: null },
    check: (result: Progress | null) =>
      result?.weekIndex === 0 && result?.dayIndex === 1,
  },
  {
    name: "Caso 2: Último día de semana (Semana 0, Día 3) → Pasa a Semana 1, Día 0",
    input: { weekIndex: 0, dayIndex: 3, lastCompleted: null },
    check: (result: Progress | null) =>
      result?.weekIndex === 1 && result?.dayIndex === 0,
  },
  {
    name: "Caso 3: Último día de penúltima semana (Semana 2, Día 2) → Pasa a Semana 3, Día 0",
    input: { weekIndex: 2, dayIndex: 2, lastCompleted: null },
    check: (result: Progress | null) =>
      result?.weekIndex === 3 && result?.dayIndex === 0,
  },
  {
    name: "Caso 4: Último día de última semana (Semana 3, Día 1) → Pasa a siguiente (se mantiene en última)",
    input: { weekIndex: 3, dayIndex: 1, lastCompleted: null },
    check: (result: Progress | null) =>
      result?.weekIndex === 3 && result?.dayIndex === 0,
  },
  {
    name: "Caso 5: Progreso con lastCompleted anterior → Se actualiza la fecha",
    input: { weekIndex: 1, dayIndex: 1, lastCompleted: "2025-11-10" },
    check: (result: Progress | null) =>
      result?.weekIndex === 1 &&
      result?.dayIndex === 2 &&
      result?.lastCompleted !== null,
  },
];

// Helper: Simple assertion
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASÓ: ${message}`);
  }
}
console.log("🧪 Iniciando tests de advanceProgress...\n");

testCases.forEach((testCase, idx) => {
  console.log(`\n🔹 ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.input)}`);

  const result = simulateAdvanceProgress(testCase.input, mockRoutine);

  console.log(`   Output: ${JSON.stringify(result)}`);

  assert(result !== null, `El resultado no es nulo`);
  assert(testCase.check(result), `Validaciones de caso ${idx + 1} pasadas`);
  assert(result!.lastCompleted !== null, `lastCompleted no es nulo`);
});

console.log("\n✨ ¡Todos los tests pasaron exitosamente!\n");

// Summary
console.log("📊 Resumen:");
console.log(`   - Total de tests: ${testCases.length}`);
console.log(`   - Semanas en rutina: ${mockRoutine.rutina_periodizada.length}`);
console.log(
  `   - Días por semana: ${mockRoutine.rutina_periodizada
    .map((w) => w.dias.length)
    .join(", ")}`
);
console.log("\n💡 Notas:");
console.log(
  "   - El sistema evita salir de la última semana si el usuario completa todos los días."
);
console.log(
  "   - Las transiciones de semana son automáticas cuando se completa el último día."
);
console.log(
  "   - La fecha se actualiza siempre al avanzar (para trackear sesiones)."
);
