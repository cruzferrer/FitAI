import { Stack } from "expo-router";
import React from "react";
import { AuthProvider } from "../hooks/auth/useAuth";
import { COLORS } from "../constants/theme"; // Importa tus colores

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="workout" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </AuthProvider>
  );
}
