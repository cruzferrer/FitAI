import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../../constants/supabaseClient";

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Por favor, ingresa tu correo.");
      return;
    }
    setIsLoading(true);
    // Lógica de Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "exp://tu-app/redirect", // Debes configurar esto en Supabase
    });
    setIsLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Email Enviado",
        "Se ha enviado un enlace de recuperación a tu correo."
      );
    }
  };

  return { email, setEmail, isLoading, handlePasswordReset };
};
