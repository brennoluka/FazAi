import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const palettes = {
  light: { background: '#FBFCF6', surface: '#FFFFFF', surfaceMuted: '#F2F6ED', text: '#203A30', muted: '#718078', border: '#DDE6DB', primary: '#1D4636', lime: '#D5FA75', coral: '#EF7655', warning: '#B7791F', tab: '#FFFFFF' },
  dark: { background: '#101A16', surface: '#18251F', surfaceMuted: '#22342B', text: '#F1F7ED', muted: '#B4C2B8', border: '#30463A', primary: '#B9E878', lime: '#D5FA75', coral: '#FF9478', warning: '#F2C56E', tab: '#14211B' },
};

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    AsyncStorage.multiGet(['fazai:dark', 'fazai:contrast', 'fazai:textScale', 'fazai:orders']).then((entries) => {
      const values = Object.fromEntries(entries);
      if (values['fazai:dark'] != null) setDarkMode(values['fazai:dark'] === 'true');
      if (values['fazai:contrast'] != null) setAltoContraste(values['fazai:contrast'] === 'true');
      if (values['fazai:textScale']) setTextScale(Number(values['fazai:textScale']) || 1);
      if (values['fazai:orders']) setPedidos(JSON.parse(values['fazai:orders']));
    }).catch(() => {});
  }, []);

  function persist(key, value) { AsyncStorage.setItem(key, String(value)).catch(() => {}); }
  function alternarDarkMode() { setDarkMode((value) => { persist('fazai:dark', !value); return !value; }); }
  function alternarContraste() { setAltoContraste((value) => { persist('fazai:contrast', !value); return !value; }); }
  function alterarEscala(value) { const next = Math.min(1.25, Math.max(0.9, value)); setTextScale(next); persist('fazai:textScale', next); }
  function salvarPedidos(next) { setPedidos(next); AsyncStorage.setItem('fazai:orders', JSON.stringify(next)).catch(() => {}); }
  function criarPedido(pedido) { salvarPedidos([{ ...pedido, id: `pedido-${Date.now()}`, status: 'aguardando_pagamento', criadoEm: new Date().toISOString() }, ...pedidos]); }
  function atualizarPedido(id, patch) { salvarPedidos(pedidos.map((pedido) => pedido.id === id ? { ...pedido, ...patch } : pedido)); }

  const colors = useMemo(() => {
    const base = palettes[darkMode ? 'dark' : 'light'];
    return altoContraste ? { ...base, background: darkMode ? '#000000' : '#FFFFFF', surface: darkMode ? '#0D0D0D' : '#FFFFFF', text: darkMode ? '#FFFFFF' : '#000000', border: darkMode ? '#FFFFFF' : '#111111', muted: darkMode ? '#F0F0F0' : '#202020' } : base;
  }, [darkMode, altoContraste]);

  const value = useMemo(() => ({ darkMode, altoContraste, textScale, colors, pedidos, alternarDarkMode, alternarContraste, alterarEscala, criarPedido, atualizarPedido }), [darkMode, altoContraste, textScale, colors, pedidos]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa ser usado dentro de AppProvider');
  return context;
}
