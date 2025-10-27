// Define los colores necesarios para la aplicación y los esquemas light/dark
export const tintColorLight = '#007AFF'; // Azul de acento
export const tintColorDark = '#007AFF';

// Nuestros colores para la aplicación (Basado en el tema oscuro de Hevy)
export const COLORS = {
  background: '#121212', // Fondo oscuro principal
  primaryText: '#FFFFFF', // Texto principal
  secondaryText: '#AAAAAA', // Texto secundario
  accent: '#007AFF', // Azul vibrante
  inputBackground: '#282828', // Fondo de inputs
  separator: '#3A3A3A', // Líneas divisorias
};

// Estructura de Colors que los hooks de Expo esperan (incluyendo light y dark)
const _Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: COLORS.primaryText,       // Usamos el blanco
    background: COLORS.background,  // Usamos el oscuro de Hevy
    tint: tintColorDark,
    icon: COLORS.secondaryText,
    tabIconDefault: COLORS.secondaryText,
    tabIconSelected: tintColorDark,
  },
};

// Exportamos ambas estructuras
export const Colors = _Colors as typeof _Colors;

export default COLORS; // Exportación por defecto para el uso en componentes