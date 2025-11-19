import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

interface RoutineStartCardProps {
  dia: string;
  fase: string;
  onPress: () => void;
}

const RoutineStartCard: React.FC<RoutineStartCardProps> = ({
  dia,
  fase,
  onPress,
}) => {
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.headerTitle}>— Tu Rutina de Hoy —</Text>

      {/* Información de la Rutina */}
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name="calendar-check"
          size={30}
          color={COLORS.accent}
        />
        <View style={styles.textGroup}>
          <Text style={styles.dayText}>{dia}</Text>
          <Text style={styles.phaseText}>Fase: {fase}</Text>
        </View>
      </View>

      {/* Botón de Inicio */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>Empezar Entrenamiento</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.primaryText}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.separator,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  textGroup: {
    marginLeft: 15,
    flex: 1,
  },
  dayText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
  phaseText: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: 2,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primaryText,
    marginRight: 5,
  },
});

export default RoutineStartCard;
