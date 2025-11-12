import { Stack } from "expo-router";
import { COLORS } from "@/constants/theme";

export default function NutritionStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background }, // Asegura el fondo oscuro
      }}
    >
      {/* Pantalla principal del logger (la que se ve en el tab) */}
      <Stack.Screen name="index" options={{ title: "Registro Diario" }} />
      {/* Pantalla de calculadora (se abre como sub-ruta) */}
      <Stack.Screen name="calculator" options={{ title: "Calculadora" }} />
    </Stack>
  );
}
