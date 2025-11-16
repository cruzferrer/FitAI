export function normalizeAndExpandRutina(parsed: any) {
  if (!parsed || !Array.isArray(parsed.rutina_periodizada)) return parsed;

  const baseWeeks = parsed.rutina_periodizada;
  const baseWeek0Dias = Array.isArray(baseWeeks[0]?.dias)
    ? baseWeeks[0].dias
    : [];

  const expandWeekFromBase = (desc: any) => {
    try {
      const description = typeof desc === "string" ? desc.toLowerCase() : "";
      const cloned = baseWeek0Dias.map((d: any) =>
        JSON.parse(JSON.stringify(d))
      );

      // Detect RPE change
      let targetRPE: string | null = null;
      if (description.includes("rpe 9") || description.includes("rpe9"))
        targetRPE = "RPE 9";
      else if (description.includes("rpe 8") || description.includes("rpe8"))
        targetRPE = "RPE 8";
      else if (description.includes("rpe 6") || description.includes("rpe6"))
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

  return parsed;
}
