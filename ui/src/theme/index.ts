import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  displayLarge: { fontFamily: 'System', letterSpacing: 0 },
  displayMedium: { fontFamily: 'System', letterSpacing: 0 },
  displaySmall: { fontFamily: 'System', letterSpacing: 0 },
  headlineLarge: { fontFamily: 'System', letterSpacing: 0 },
  headlineMedium: { fontFamily: 'System', letterSpacing: 0 },
  headlineSmall: { fontFamily: 'System', letterSpacing: 0 },
  titleLarge: { fontFamily: 'System', letterSpacing: 0 },
  titleMedium: { fontFamily: 'System', letterSpacing: 0 },
  titleSmall: { fontFamily: 'System', letterSpacing: 0 },
  bodyLarge: { fontFamily: 'System', letterSpacing: 0 },
  bodyMedium: { fontFamily: 'System', letterSpacing: 0 },
  bodySmall: { fontFamily: 'System', letterSpacing: 0 },
  labelLarge: { fontFamily: 'System', letterSpacing: 0 },
  labelMedium: { fontFamily: 'System', letterSpacing: 0 },
  labelSmall: { fontFamily: 'System', letterSpacing: 0 }
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#006A6A',
    secondary: '#00A7A7',
    surface: '#FFFFFF',
    background: '#F4F6F6',
    surfaceVariant: '#E0F2F1',
    error: '#B00020'
  },
  fonts: configureFonts({ config: fontConfig })
};
