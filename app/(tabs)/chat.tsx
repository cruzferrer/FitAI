import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { useChat, Message } from "../../hooks/tabs/useChat"; // <-- NUEVO HOOK

const ChatScreen: React.FC = () => {
  // Consumimos el hook
  const { messages, inputText, setInputText, handleSend, isLoading } =
    useChat();

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user"
          ? styles.userMessageContainer
          : styles.botMessageContainer,
      ]}
    >
      <Text
        style={
          item.sender === "user"
            ? styles.userMessageText
            : styles.botMessageText
        }
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Text style={styles.headerTitle}>Chatbot Fit AI</Text>

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
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color={COLORS.primaryText}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryText,
    textAlign: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  messageList: { paddingHorizontal: 10, paddingTop: 10 },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessageContainer: {
    backgroundColor: COLORS.accent,
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  botMessageContainer: {
    backgroundColor: COLORS.inputBackground,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.separator,
  },
  userMessageText: { color: COLORS.primaryText },
  botMessageText: { color: COLORS.primaryText },
  inputContainer: {
    flexDirection: "row",
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
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.separator,
  },
});

export default ChatScreen;
