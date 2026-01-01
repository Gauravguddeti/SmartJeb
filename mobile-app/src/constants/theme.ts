/**
 * Theme constants for the application
 * Contains colors, spacing, and other design values
 */

// Color palette
export const COLORS = {
  primary: '#6200EE',
  primaryDark: '#3700B3',
  secondary: '#03DAC6',
  secondaryDark: '#018786',
  background: '#FFFFFF',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  error: '#B00020',
  errorDark: '#CF6679',
  text: '#000000',
  textDark: '#FFFFFF',
  textSecondary: '#757575',
  textSecondaryDark: '#BBBBBB',
  border: '#E0E0E0',
  borderDark: '#2C2C2C',

  // Category colors
  food: '#FF5722',
  transport: '#4CAF50',
  shopping: '#2196F3',
  housing: '#9C27B0',
  utilities: '#FF9800',
  healthcare: '#795548',
  entertainment: '#F44336',
  education: '#3F51B5',
  personal: '#607D8B',
  others: '#9E9E9E',
};

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  small: 14,
  medium: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Spacing
export const SPACING = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  round: 50,
};

// Shadows
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Theme configuration for light/dark mode
export const lightTheme = {
  colors: {
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    textSecondary: COLORS.textSecondary,
    border: COLORS.border,
  },
  shadows: SHADOWS,
};

export const darkTheme = {
  colors: {
    background: COLORS.backgroundDark,
    surface: COLORS.surfaceDark,
    text: COLORS.textDark,
    textSecondary: COLORS.textSecondaryDark,
    border: COLORS.borderDark,
  },
  shadows: SHADOWS,
};

export default {
  COLORS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  lightTheme,
  darkTheme,
};
