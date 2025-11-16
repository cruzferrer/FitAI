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
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2; // Leave space for stroke
  const circumference = 2 * Math.PI * radius;
  const coverLength = circumference - progress * circumference;
  // shift overlay by half stroke width so the visible arc keeps its rounded cap
  const overlayOffsetShift = strokeWidth / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Map the gradient from top to bottom in user space so the 0% stop
              corresponds to the top of the circle. This, combined with the
              circle's -90deg rotation, makes the gradient start at the top and
              progress clockwise. */}
          <LinearGradient
            id="circleGrad"
            gradientUnits="userSpaceOnUse"
            x1={size / 2}
            y1={0}
            x2={size / 2}
            y2={size}
          >
            <Stop offset="100%" stopColor="#FF4500" stopOpacity="1" />
            {/* Rojo */}
            <Stop offset="66%" stopColor="#FFA500" stopOpacity="1" />
            {/* Naranja */}
            <Stop offset="33%" stopColor="#FFD700" stopOpacity="1" />
            {/* Amarillo */}
            <Stop offset="0%" stopColor="#32CD32" stopOpacity="1" />
            {/* Verde */}
          </LinearGradient>
        </Defs>

        {/* Gradient visible across the whole circle (we'll mask the unfilled arc) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#circleGrad)"
          strokeWidth={6}
          fill="transparent"
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />

        {/* Overlay the unfilled portion with the background stroke so the gradient
            is only revealed up to the current progress. Shift the overlay by
            half the stroke width to avoid covering the rounded cap of the
            visible arc; use a flat cap on the overlay to keep the cover neat. */}
        {progress < 1 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.inputBackground}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${coverLength} ${circumference}`}
            strokeDashoffset={-progress * circumference + overlayOffsetShift}
            strokeLinecap="butt"
            rotation="-90"
            originX={size / 2}
            originY={size / 2}
          />
        )}
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
