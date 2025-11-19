import React from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { COLORS } from "../../constants/theme";

interface GradientProgressBarProps {
  progress: number; // 0 a 1
}

const GradientProgressBar: React.FC<GradientProgressBarProps> = ({
  progress,
}) => {
  const [width, setWidth] = React.useState(0);
  const height = 10;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const progressWidth = width * Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, { height }]} onLayout={onLayout}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Use userSpaceOnUse so the gradient maps to absolute coordinates of the
              SVG (the full container width). This allows us to draw a smaller
              rect (the filled portion) and still sample the gradient fixed to
              the full container, preventing the gradient from rescaling. */}
          <LinearGradient
            id="grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={String(width)}
            y2="0"
          >
            <Stop offset="0%" stopColor="#FF4500" stopOpacity="1" />
            {/* Naranja */}
            <Stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
            {/* Amarillo */}
            <Stop offset="100%" stopColor="#32CD32" stopOpacity="1" />
            {/* Verde */}
          </LinearGradient>
        </Defs>

        {/* Fondo (barra vacía) */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          rx={height / 2}
          fill={COLORS.inputBackground}
        />

        {/* Barra de progreso: draw only up to progressWidth, with rounded caps.
            Because the gradient uses userSpaceOnUse mapped to the full width,
            the visible segment will show the correct slice of the gradient. */}
        {progressWidth > 0 && (
          <Rect
            x={0}
            y={0}
            width={progressWidth}
            height={height}
            rx={height / 2}
            fill="url(#grad)"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
});

export default GradientProgressBar;
