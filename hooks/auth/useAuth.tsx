import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../constants/supabaseClient"; // Importamos el cliente real
import { Session } from "@supabase/supabase-js";

// 1. Define el contexto y el tipo de datos
interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Haremos que las funciones devuelvan el error si existe
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Proveedor de Contexto (donde vive la lógica de estado)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos cargando

  useEffect(() => {
    setIsLoading(true);

    // 1. Intenta obtener la sesión que ya existe (si el usuario ya se logueó)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Escucha cambios en la autenticación (Login, Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    // Limpia el listener al desmontar
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Funciones de Supabase (Reales)
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    // Aquí puedes manejar la creación de un 'perfil' si lo deseas
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    session,
    isAuthenticated: !!session, // True si hay sesión
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook para consumir el Contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
