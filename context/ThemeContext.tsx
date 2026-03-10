// context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';

export const dark = {
  bg:         '#0f172a',
  surface:    '#1e293b',
  surface2:   '#172032',
  surfaceAlt: '#334155',
  text:       '#f1f5f9',
  textSub:    '#64748b',
  textMuted:  '#475569',
  border:     '#334155',
  inputBg:    '#1e293b',
  avatarBg:   '#0f172a',
  barBg:      '#1e293b',
  headerFrom: '#0f172a',
  headerTo:   '#1a2639',
  rowFrom:    '#1e293b',
  rowTo:      '#172032',
  overlay:    'rgba(0,0,0,0.6)',
  cardBg:     '#1e293b',
  toggleBg:   '#0f172a',
  isDark:     true,
};

export const light = {
  bg:         '#f1f5f9',
  surface:    '#ffffff',
  surface2:   '#f8fafc',
  surfaceAlt: '#e2e8f0',
  text:       '#0f172a',
  textSub:    '#64748b',
  textMuted:  '#94a3b8',
  border:     '#e2e8f0',
  inputBg:    '#f8fafc',
  avatarBg:   '#e2e8f0',
  barBg:      '#e2e8f0',
  headerFrom: '#1d4ed8',
  headerTo:   '#2563eb',
  rowFrom:    '#ffffff',
  rowTo:      '#f8fafc',
  overlay:    'rgba(0,0,0,0.4)',
  cardBg:     '#ffffff',
  toggleBg:   '#f1f5f9',
  isDark:     false,
};

export type Theme = typeof dark;

type ThemeCtx = { theme: Theme; isDark: boolean; toggle: () => void };
const ThemeContext = createContext<ThemeCtx>({ theme: dark, isDark: true, toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? dark : light;
  const toggle = () => setIsDark(p => !p);
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);