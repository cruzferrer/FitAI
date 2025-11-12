import { useState } from "react";

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

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText("");
    setIsLoading(true); // El bot está "pensando"

    // Simular la respuesta de la IA (futura llamada a Edge Function)
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now().toString() + "bot",
        text: `(Respuesta IA) Entendido: "${newUserMessage.text}". Aún estoy aprendiendo a chatear.`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  return { messages, inputText, setInputText, handleSend, isLoading };
};
