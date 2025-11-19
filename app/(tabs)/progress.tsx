import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import Sparkline from "../../components/Dashboard/Sparkline";
import { useProgressData } from "../../hooks/tabs/useProgressData";

const ProgressScreen: React.FC = () => {
  const { sessions, isLoading, fatigueTrend } = useProgressData(20);
  const fatigueLabels = (sessions || [])
    .map((s) => (s.fecha_sesion ? s.fecha_sesion.split("T")[0] : ""))
    .reverse();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <MaterialCommunityIcons
          name="chart-bar"
          size={60}
          color={COLORS.accent}
          style={styles.icon}
        />

        <Text style={styles.title}>Tu Progreso Fitness</Text>
        <Text style={styles.subtitle}>Historial de Cargas y Gráficos</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mesociclo Actual</Text>
          <Text style={styles.cardText}>
            Semana 4 de 6 (Fase de Intensificación)
          </Text>
        </View>

        <Text
          style={[styles.cardTitle, { alignSelf: "flex-start", marginTop: 10 }]}
        >
          Fatigue Trend
        </Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.accent} />
        ) : fatigueTrend && fatigueTrend.length > 0 ? (
          <View style={{ width: "100%", marginTop: 10 }}>
            <Sparkline
              data={fatigueTrend}
              labels={fatigueLabels}
              width={320}
              height={90}
              stroke={COLORS.accent}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Aún no hay sesiones registradas.
            </Text>
          </View>
        )}

        <View style={{ width: "100%", marginTop: 20 }}>
          {sessions.map((s, idx) => (
            <View key={String(s.id || idx)} style={styles.sessionRow}>
              <Text style={styles.sessionTitle}>
                {s.nombre_dia || "Entrenamiento"}
              </Text>
              <Text style={styles.sessionMeta}>
                {s.fecha_sesion?.split("T")[0]} • {s.duracion_minutos} min
              </Text>
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
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondaryText,
    marginBottom: 30,
    textAlign: "center",
  },
  card: {
    width: "100%",
    padding: 15,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.accent,
    marginBottom: 5,
  },
  cardText: {
    color: COLORS.primaryText,
    fontSize: 16,
  },
  placeholder: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderStyle: "dashed",
  },
  placeholderText: {
    color: COLORS.secondaryText,
    textAlign: "center",
    fontStyle: "italic",
  },
  sessionRow: {
    width: "100%",
    padding: 12,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primaryText,
  },
  sessionMeta: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 6,
  },
});

export default ProgressScreen;
