import { Redirect, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../hooks/auth/useAuth";
import { COLORS } from "../constants/theme";

SplashScreen.preventAutoHideAsync();

export default function RootRedirector() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Lógica de Redirección
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />; // Envía a app/(auth)/index.tsx
  }

  // Si SÍ hay sesión, vamos a las pestañas principales
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
