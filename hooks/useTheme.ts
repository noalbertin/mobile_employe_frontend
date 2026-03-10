// hooks/useTheme.ts
import { useState } from 'react';

export const lightTheme = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  surface2: '#e2e8f0',
  text: '#0f172a',
  textSub: '#64748b',
  border: '#cbd5e1',
  header: ['#3b82f6', '#2563eb'] as const,
};

export const darkTheme = {
  bg: '#0f172a',
  surface: '#1e293b',
  surface2: '#172032',
  text: '#f1f5f9',
  textSub: '#64748b',
  border: '#334155',
  header: ['#0f172a', '#1a2639'] as const,
};

export function useTheme() {
  const [dark, setDark] = useState(true);
  const theme = dark ? darkTheme : lightTheme;
  const toggle = () => setDark(prev => !prev);
  return { theme, dark, toggle };
}