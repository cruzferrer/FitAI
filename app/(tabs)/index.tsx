import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import HomeHeader from "@/components/Headers/HomeHeader";
import RoutineStartCard from "@/components/Cards/RoutineStartCard";
import { useHomeScreenData } from "../../hooks/tabs/useHomeScreenData"; // <-- NUEVO HOOK

const HomeScreen: React.FC = () => {
  // Consumimos el hook que maneja toda la lógica
  const { isLoading, rutina, error, handlers, router } = useHomeScreenData();
  const {
    handleSearch,
    handleNotifications,
    handleLogout,
    handleStartWorkout,
  } = handlers;

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader
          onSearchPress={handleSearch}
          onNotificationsPress={handleNotifications}
          onLogoutPress={handleLogout}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.subtitle}>Cargando tu rutina...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (
    error ||
    !rutina ||
    !rutina.rutina_periodizada ||
    rutina.rutina_periodizada.length === 0
  ) {
    // Si no hay rutina guardada o hay un error
    return (
      <SafeAreaView style={styles.safeArea}>
        <HomeHeader
          onSearchPress={handleSearch}
          onNotificationsPress={handleNotifications}
          onLogoutPress={handleLogout}
        />
        <View style={styles.loaderContainer}>
          <Text style={styles.title}>No hay rutina activa</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/onboarding")}
          >
            <Text style={styles.subtitleLink}>Generar mi primer Mesociclo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Si todo está bien, extraemos los datos de la rutina real
  const semanaActual = rutina.rutina_periodizada[0]; // (Semana 1)
  const diaActual = semanaActual.dias[0];
  const proximosDias = semanaActual.dias.slice(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader
        onSearchPress={handleSearch}
        onNotificationsPress={handleNotifications}
        onLogoutPress={handleLogout}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* TARJETA DE INICIO (Datos reales de la IA) */}
        <RoutineStartCard
          dia={diaActual.dia_entrenamiento}
          fase={semanaActual.fase}
          onPress={() => handleStartWorkout(diaActual.dia_entrenamiento)}
        />

        {/* PRÓXIMOS ENTRENAMIENTOS (Datos reales de la IA) */}
        <Text style={styles.nextTitle}>
          — Próximos Entrenamientos (Semana {semanaActual.semana}) —
        </Text>

        <View style={styles.nextList}>
          {proximosDias.map((dia, index) => (
            <View key={index} style={styles.nextDayCard}>
              <Text style={styles.nextDayText}>{dia.dia_entrenamiento}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Añadido para que el texto no toque los bordes
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginTop: 20,
    textAlign: "center",
  },
  subtitleLink: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 20,
    textDecorationLine: "underline",
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondaryText,
    marginBottom: 15,
    textAlign: "center",
  },
  nextList: {
    width: "100%",
  },
  nextDayCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  nextDayText: {
    fontSize: 16,
    color: COLORS.primaryText,
    fontWeight: "500",
  },
});

export default HomeScreen;
