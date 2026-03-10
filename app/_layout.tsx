// app/_layout.tsx
import { DarkTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import "@/global.css";
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export const unstable_settings = { anchor: '(tabs)' };

// Inner component so it can consume useTheme()
function AppNavigator() {
  const { isDark } = useTheme();

  const NavTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: isDark ? '#0f172a' : '#f1f5f9',
      card:       isDark ? '#0f172a' : '#ffffff',
      border:     isDark ? '#1e293b' : '#e2e8f0',
    },
  };

  return (
    <NavThemeProvider value={NavTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent={false} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}