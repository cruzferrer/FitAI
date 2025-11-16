import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface GradientCircleProgressProps {
  size: number;
  progress: number; // 0 a 1
  textContent: string;
  textStyle?: any;
}

const GradientCircleProgress: React.FC<GradientCircleProgressProps> = ({
  size,
  progress,
  textContent,
  textStyle,
}) => {
  const radius = (size - 12) / 2; // Dejar espacio para el stroke
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF4500" stopOpacity="1" />
            {/* Rojo-Naranja */}
            <Stop offset="33%" stopColor="#FFA500" stopOpacity="1" />
            {/* Naranja */}
            <Stop offset="66%" stopColor="#FFD700" stopOpacity="1" />
            {/* Amarillo */}
            <Stop offset="100%" stopColor="#32CD32" stopOpacity="1" />
            {/* Verde */}
          </LinearGradient>
        </Defs>

        {/* Círculo de fondo (gris vacío) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.inputBackground}
          strokeWidth={6}
          fill="transparent"
        />

        {/* Círculo de progreso (con gradiente) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circleGrad)"
          strokeWidth={6}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Texto centrado */}
      <Text style={[styles.text, textStyle]}>{textContent}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryText,
  },
});

export default GradientCircleProgress;
