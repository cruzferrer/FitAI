import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

import { COLORS } from "@/constants/theme";

// Extendemos las props de TouchableOpacity para aceptar todas sus propiedades nativas
interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean; // Estado opcional para manejar la carga
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style, // Para estilos adicionales pasados desde la pantalla
  ...rest // Para otras props (como accessibilityLabel)
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={COLORS.primaryText} size="small" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: COLORS.accent, // Color azul vibrante
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%", // Ocupa el 100% del contenedor por defecto
  },
  buttonText: {
    color: COLORS.primaryText, // Color blanco
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: `${COLORS.accent}60`, // Color de acento con opacidad reducida
    opacity: 0.8,
  },
});

export default PrimaryButton;
