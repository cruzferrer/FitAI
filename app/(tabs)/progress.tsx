import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

const ProgressScreen: React.FC = () => {
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

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            [Aquí se insertarán Gráficos de Carga (Kg/Lbs) y Tendencias de RPE]
          </Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            [Aquí se mostrará el Historial de Sesiones Completadas (RF4.5)]
          </Text>
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
});

export default ProgressScreen;
