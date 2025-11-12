import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/theme";
import GradientProgressBar from "./GradientProgressBar";

interface CalorieWidgetProps {
  consumed: number;
  target: number;
}

const CalorieWidget: React.FC<CalorieWidgetProps> = ({ consumed, target }) => {
  const progress = target > 0 ? Math.min(consumed / target, 1) : 0;
  const remaining = target - consumed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calories Remaining</Text>
        <Text style={styles.value}>
          {remaining} <Text style={styles.unit}>kcal</Text>
        </Text>
      </View>

      <GradientProgressBar progress={progress} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{consumed} consumed</Text>
        <Text style={styles.footerText}>{target} target</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: "bold",
  },
  unit: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontWeight: "normal",
  },
  progressBar: {
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  footerText: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
});

export default CalorieWidget;
