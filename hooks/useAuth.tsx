import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Define el contexto y el tipo de datos
interface AuthContextType {
 isAuthenticated: boolean;
 isLoading: boolean;
  // Métodos que serán implementados con Supabase
  signIn: (email: string, pass: string) => Promise<void>; 
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Crea el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Proveedor de Contexto (donde vive la lógica de estado)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // ------------------------------------------------------------------
  // CAMBIO CLAVE 1: Inicializar la sesión con un valor NO nulo
  // Esto hace que isAuthenticated sea TRUE desde el inicio
  // ------------------------------------------------------------------
  const [session, setSession] = useState<any>({ user: 'dev' }); 
  
  // ------------------------------------------------------------------
  // CAMBIO CLAVE 2: Inicializar isLoading a FALSE
  // Esto elimina el tiempo de espera y el spinner
  // ------------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------------------------------
  // CAMBIO CLAVE 3: Comentar el useEffect de simulación de carga
  // Esto evita que se sobrescriba la sesión con 'null' después de 1 segundo
  // ------------------------------------------------------------------
  /* useEffect(() => {
    setTimeout(() => {
      setSession(null); 
      setIsLoading(false);
    }, 1000); 
  }, []);
  */

  // Funciones de Supabase (Simuladas por ahora)
  const signIn = async (email: string, pass: string) => {
    console.log('Intento de SignIn');
    setSession({ user: 'mock' }); // Simular éxito y forzar redirección
  };

  const signUp = async (email: string, pass: string) => {
    console.log('Intento de SignUp');
    setSession({ user: 'mock' }); // Simular éxito y forzar redirección
  };

  const signOut = async () => {
    console.log('SignOut ejecutado');
    setSession(null); 
  };
  
  // El valor de Contexto que se pasará a la app
  const value: AuthContextType = {
    isAuthenticated: !!session, // Esto ahora es TRUE
    isLoading,                 // Esto ahora es FALSE
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};