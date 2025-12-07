import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

const MetricsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Metrics</Text>
        <Text style={styles.subtitle}>Próximamente métricas detalladas.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
  },
});

export default MetricsScreen;
