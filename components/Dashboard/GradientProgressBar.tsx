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
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FF4500" stopOpacity="1" />
            {/* Naranja */}
            <Stop offset="0.5" stopColor="#FFD700" stopOpacity="1" />
            {/* Amarillo */}
            <Stop offset="1" stopColor="#32CD32" stopOpacity="1" />
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
        {/* Barra de progreso (con gradiente) */}
        <Rect
          x="0"
          y="0"
          width={progressWidth}
          height={height}
          rx={height / 2}
          fill="url(#grad)"
        />
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
