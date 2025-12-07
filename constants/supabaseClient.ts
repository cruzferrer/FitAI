import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// 🚨 REEMPLAZA ESTOS VALORES
const supabaseUrl = "https://bcehelazqipkgdhvwcqk.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjZWhlbGF6cWlwa2dkaHZ3Y3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MDQxMzMsImV4cCI6MjA3NzE4MDEzM30.ReP15P_g9szKGgOBJMvoyYPELKbZE9jGI0sgG0feWQs"; // (Encuéntrala en Settings > API)

// Verificar que las credenciales estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase credentials missing - using mock client");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usa AsyncStorage para guardar la sesión en React Native
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
