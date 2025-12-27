import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../constants/supabaseClient"; // Importamos el cliente real
import { Session } from "@supabase/supabase-js";

// 1. Define el contexto y el tipo de datos
interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Nuevo: indica si el usuario completó el onboarding (tiene rutina generada)
  isOnboarded: boolean;
  // Nuevo: indica si el perfil/nutrición/perfiles están configurados
  profileComplete: boolean;
  // Haremos que las funciones devuelvan el error si existe
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    pass: string,
    userData?: { full_name: string; username: string }
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Proveedor de Contexto (donde vive la lógica de estado)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos cargando
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [profileComplete, setProfileComplete] = useState<boolean>(false);

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

  // Chequeo adicional: detectar si el usuario ya tiene una rutina
  useEffect(() => {
    const checkOnboarded = async () => {
      try {
        const routine = await AsyncStorage.getItem("@FitAI_UserRoutine");
        setIsOnboarded(!!routine);
      } catch {
        setIsOnboarded(false);
      }
    };

    checkOnboarded();
  }, []);

  // Leer si perfil está completo en Supabase (parametros_usuario.profile_complete)
  useEffect(() => {
    let cancelled = false;
    const checkProfile = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) {
          setProfileComplete(false);
          return;
        }

        const { data, error } = await supabase
          .from("parametros_usuario")
          .select("profile_complete")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;
        if (!cancelled) setProfileComplete(Boolean(data?.profile_complete));
      } catch {
        if (!cancelled) setProfileComplete(false);
      }
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  // Funciones de Supabase (Reales)
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    userData?: { full_name: string; username: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData, // Metadata for the trigger
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    session,
    isAuthenticated: !!session, // True si hay sesión
    isLoading,
    isOnboarded,
    profileComplete,
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
