import { useState } from "react";
import { Alert } from "react-native";
// Asumiremos que creas una función 'chatbot-query' en Supabase para manejar el LLM
import { supabase } from "@/constants/supabaseClient";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hola! Soy FitAI, tu asistente inteligente de entrenamiento. Pregúntame sobre tu rutina, nutrición o técnica de ejercicios.",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true); // El bot está "pensando"

    try {
      // 🚨 LLAMADA REAL A LA EDGE FUNCTION
      const { data, error: invokeError } = await supabase.functions.invoke(
        "chatbot-query",
        {
          method: "POST",
          body: {
            user_prompt: newUserMessage.text,
            // Puedes pasar el historial de mensajes si quieres que tenga contexto
            // conversation_history: messages.slice(-5)
          },
        }
      );

      if (invokeError) throw new Error(invokeError.message);

      // Asumimos que la Edge Function devuelve { response: "..." }
      const botResponse: Message = {
        id: Date.now().toString() + "bot",
        text:
          data.response || "Lo siento, la IA no pudo procesar tu solicitud.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (e: any) {
      Alert.alert("Error de Chatbot", e.message);
      setMessages((prev) => [
        ...prev,
        { id: "error", text: "Error de conexión con la IA.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, inputText, setInputText, handleSend, isLoading };
};
