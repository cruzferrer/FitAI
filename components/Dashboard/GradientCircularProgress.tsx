import React from "react";
import CircularProgress from "react-native-circular-progress-indicator";
import { COLORS } from "../../constants/theme";

interface GradientCircularProgressProps {
  progress: number; // Valor de 0 a 100
}

const GradientCircularProgress: React.FC<GradientCircularProgressProps> = ({
  progress,
}) => {
  return (
    <CircularProgress
      value={progress}
      radius={35}
      duration={1000}
      progressValueColor={COLORS.primaryText}
      maxValue={100}
      title={""}
      titleColor={"white"}
      titleStyle={{ fontWeight: "bold" }}
      activeStrokeColor={"#2ecc71"} // Color final (verde)
      inActiveStrokeColor={COLORS.inputBackground}
      inActiveStrokeOpacity={0.5}
      inActiveStrokeWidth={6}
      activeStrokeWidth={8}
      // Aquí definimos el gradiente: Naranja -> Amarillo -> Verde
      activeStrokeSecondaryColor={"#e74c3c"} // Color inicial (naranja/rojo)
    />
  );
};

export default GradientCircularProgress;
