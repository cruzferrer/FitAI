import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '../../constants/theme'; 

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: 'Hola! Soy FitAI, tu asistente inteligente de entrenamiento. Pregúntame sobre tu rutina, nutrición o técnica de ejercicios.', 
      sender: 'bot' 
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
    };
    
    // 1. Añadir el mensaje del usuario
    setMessages((prev) => [...prev, newUserMessage]);
    
    // 2. Simular la respuesta de la IA
    setTimeout(() => {
        const botResponse: Message = {
            id: Date.now().toString() + 'bot',
            text: `(IA) Entendido: "${newUserMessage.text}". Aquí iría la respuesta generada por Gemini API...`,
            sender: 'bot',
        };
        setMessages((prev) => [...prev, botResponse]);
    }, 1000);

    setInputText('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
    ]}>
      <Text style={item.sender === 'user' ? styles.userMessageText : styles.botMessageText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Ajuste para la barra de pestañas
      >
        <Text style={styles.headerTitle}>Chatbot Fit AI</Text>
        
        {/* Lista de Mensajes */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          inverted // Muestra los mensajes más nuevos abajo
        />

        {/* Área de Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pregúntale algo a FitAI..."
            placeholderTextColor={COLORS.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primaryText,
    textAlign: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessageContainer: {
    backgroundColor: COLORS.accent, // Mensajes del usuario en color de acento
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  botMessageContainer: {
    backgroundColor: COLORS.inputBackground, // Mensajes del bot en color de input
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  userMessageText: {
    color: COLORS.primaryText, // Texto blanco
  },
  botMessageText: {
    color: COLORS.primaryText, // Texto blanco
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    color: COLORS.primaryText,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;