async function run() {
  const mod = await import("../app/utils/expandRoutine.ts");
  const normalizeAndExpandRutina = mod.normalizeAndExpandRutina;

  // Sample minimal payload (use the real structure if available)
  const sample = {
  rutina_periodizada: [
    {
      semana: 1,
      fase: "Acumulación - Volumen Base",
      dias: [
        { dia_entrenamiento: "Día 1 - Push", grupos: [{ grupo_muscular: "Pecho", ejercicios: [{ nombre: "Press Banca", series: "4", repeticiones: "8-10", carga_notacion: "RPE 7" }] }] },
        { dia_entrenamiento: "Día 2 - Pull", grupos: [{ grupo_muscular: "Espalda", ejercicios: [{ nombre: "Remo", series: "4", repeticiones: "6-8", carga_notacion: "RPE 7" }] }] },
        { dia_entrenamiento: "Día 3 - Legs", grupos: [{ grupo_muscular: "Piernas", ejercicios: [{ nombre: "Sentadilla", series: "4", repeticiones: "6-8", carga_notacion: "RPE 7" }] }] },
        { dia_entrenamiento: "Día 4 - Push Avanzado", grupos: [{ grupo_muscular: "Pecho", ejercicios: [{ nombre: "Press Inclinado", series: "4", repeticiones: "6-8", carga_notacion: "RPE 8" }] }] },
        { dia_entrenamiento: "Día 5 - Pull Avanzado", grupos: [{ grupo_muscular: "Espalda", ejercicios: [{ nombre: "Peso Muerto", series: "4", repeticiones: "6-8", carga_notacion: "RPE 8" }] }] },
        { dia_entrenamiento: "Día 6 - Legs Avanzado", grupos: [{ grupo_muscular: "Piernas", ejercicios: [{ nombre: "Zancadas", series: "4", repeticiones: "6-8", carga_notacion: "RPE 8" }] }] },
      ],
    },
    { semana: 2, fase: "Progresión", dias: "Replicar estructura de ejercicios de Semana 1 con ajuste a RPE 8 para todos los ejercicios." },
    { semana: 3, fase: "Progresión - Aumento de Volumen", dias: "Replicar estructura de ejercicios de Semana 1 con incremento en series +1 en todos los ejercicios." },
    { semana: 4, fase: "Sobrecarga", dias: "Replicar estructura de ejercicios de Semana 3 con ajuste a RPE 9 para todos los ejercicios." },
    { semana: 5, fase: "Peak", dias: "Replicar estructura de ejercicios de Semana 4 manteniendo RPE 9 y añadiendo 1 serie a ejercicios clave." },
    { semana: 6, fase: "Descarga", dias: "Replicar estructura de ejercicios de Semana 1 con reducción en series a 2-3 y ajuste a RPE 6." },
  ],
};

  const repaired = normalizeAndExpandRutina(sample as any);

  const allWeeksHaveDias = Array.isArray(repaired.rutina_periodizada) && repaired.rutina_periodizada.every((w: any) => Array.isArray(w.dias) && w.dias.length > 0);

  console.log("Repaired weeks summary:", repaired.rutina_periodizada.map((w: any, i: number) => ({ index: i, semana: w.semana, diasCount: Array.isArray(w.dias) ? w.dias.length : 0 })));

  if (!allWeeksHaveDias) {
    console.error("Test failed: Not all weeks have dias arrays with content.");
    process.exit(1);
  }

  console.log("Test passed: All weeks expanded to concrete dias.");
  process.exit(0);
}

run();
