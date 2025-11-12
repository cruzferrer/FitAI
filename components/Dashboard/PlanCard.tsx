import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

interface PlanCardProps {
  type: "workout" | "nutrition";
  title: string;
  subtitle: string;
  onPress: () => void;
  isCompleted?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({
  type,
  title,
  subtitle,
  onPress,
  isCompleted = false,
}) => {
  const iconName = type === "workout" ? "dumbbell" : "food-apple";
  const iconColor = type === "workout" ? COLORS.accent : "#FF9F1C"; // Azul para workout, Naranja para nutrición

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}
      >
        <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {isCompleted ? (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={COLORS.accent}
        />
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.secondaryText}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.secondaryText,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PlanCard;
