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
// AsyncStorage intentionally removed from Home production UI
import HomeHeader from "@/components/Headers/HomeHeader";
import RoutineStartCard from "@/components/Cards/RoutineStartCard";
import { useHomeScreenData } from "../../hooks/tabs/useHomeScreenData"; // <-- NUEVO HOOK

const HomeScreen: React.FC = () => {
  // Consumimos el hook que maneja toda la lógica
  const { isLoading, rutina, progress, error, handlers, router } =
    useHomeScreenData();
  const {
    handleSearch,
    handleNotifications,
    handleLogout,
    handleStartWorkout,
  } = handlers;

  // (No persistent modal state in production)

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

  // Si todo está bien, extraemos los datos de la rutina real usando el progreso guardado
  const weekIndex = progress?.weekIndex ?? 0;
  const dayIndex = progress?.dayIndex ?? 0;

  const semanaActual =
    rutina.rutina_periodizada[weekIndex] || rutina.rutina_periodizada[0];
  const diaActual =
    (semanaActual && semanaActual.dias && semanaActual.dias[dayIndex]) ||
    (semanaActual && semanaActual.dias && semanaActual.dias[0]);

  // Próximos días: incluye días restantes de esta semana + días de semanas siguientes (hasta 6 próximos)
  const getProximosDias = () => {
    const resultado: any[] = [];
    if (!rutina || !Array.isArray(rutina.rutina_periodizada)) return resultado;

    const totalWeeks = rutina.rutina_periodizada.length;
    let currentWeekIdx = Math.max(0, Math.min(weekIndex, totalWeeks - 1));
    let currentDayIdx = Math.max(0, dayIndex + 1);

    // Itera hasta conseguir 6 próximos días o agotar semanas
    while (resultado.length < 6 && currentWeekIdx < totalWeeks) {
      const week = rutina.rutina_periodizada[currentWeekIdx];
      const dias = Array.isArray(week?.dias) ? week.dias : [];

      // Si la semana actual no tiene días, saltar a la siguiente
      if (dias.length === 0) {
        currentWeekIdx++;
        currentDayIdx = 0;
        continue;
      }

      // Asegurar que currentDayIdx no sobrepase el número de días
      if (currentDayIdx >= dias.length) currentDayIdx = 0;

      while (currentDayIdx < dias.length && resultado.length < 6) {
        resultado.push(dias[currentDayIdx]);
        currentDayIdx++;
      }

      // Avanzar a la siguiente semana
      currentWeekIdx++;
      currentDayIdx = 0;
    }

    return resultado;
  };

  const proximosDias = getProximosDias();

  // No dev debug info in production version

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
        {diaActual ? (
          <RoutineStartCard
            dia={diaActual.dia_entrenamiento}
            fase={semanaActual.fase}
            onPress={() => handleStartWorkout(diaActual.dia_entrenamiento)}
          />
        ) : (
          <View style={styles.noDayCard}>
            <Text style={styles.noDayText}>
              No hay un día activo en esta semana. Intenta completar un día
              anterior o revisa tu rutina.
            </Text>
            {proximosDias.length > 0 ? (
              <Text style={styles.noDayText}>
                Próximos:{" "}
                {proximosDias.map((d) => d.dia_entrenamiento).join(", ")}
              </Text>
            ) : null}
          </View>
        )}

        {/* PRÓXIMOS ENTRENAMIENTOS (Datos reales de la IA) */}
        <Text style={styles.nextTitle}>
          — Próximos Entrenamientos (Semana {semanaActual.semana}) —
        </Text>

        {/* Dev debug removed for production */}

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
  debugBox: {
    backgroundColor: COLORS.inputBackground,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  debugButton: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  debugButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryText,
    marginBottom: 8,
  },
  modalScroll: {
    marginBottom: 12,
  },
  modalText: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
  },
  modalCloseText: {
    color: COLORS.primaryText,
    fontWeight: "600",
  },
  noDayCard: {
    backgroundColor: COLORS.inputBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  noDayText: {
    fontSize: 14,
    color: COLORS.primaryText,
    marginBottom: 6,
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
