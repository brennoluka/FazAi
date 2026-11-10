import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const palettes = {
  light: { background: '#FBFCF6', surface: '#FFFFFF', surfaceMuted: '#F2F6ED', text: '#203A30', muted: '#68786D', border: '#DDE6DB', primary: '#1D4636', primaryText: '#FFFFFF', lime: '#D5FA75', coral: '#EF7655', warning: '#A96812', tab: '#FFFFFF', input: '#FFFFFF' },
  dark: { background: '#0D1512', surface: '#17221C', surfaceMuted: '#24352B', text: '#F7FFF3', muted: '#C1D0C5', border: '#456052', primary: '#9DDB68', primaryText: '#0D2116', lime: '#D5FA75', coral: '#FF9A7E', warning: '#FFD071', tab: '#121E17', input: '#1B2A22' },
};

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [necessidades, setNecessidades] = useState([]);
  const [servicosPublicados, setServicosPublicados] = useState([]);
  const [prestadorAtivo, setPrestadorAtivo] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['fazai:dark', 'fazai:contrast', 'fazai:textScale', 'fazai:orders', 'fazai:needs', 'fazai:published-services']).then((entries) => {
      const values = Object.fromEntries(entries);
      if (values['fazai:dark'] != null) setDarkMode(values['fazai:dark'] === 'true');
      if (values['fazai:contrast'] != null) setAltoContraste(values['fazai:contrast'] === 'true');
      if (values['fazai:textScale']) setTextScale(Number(values['fazai:textScale']) || 1);
      if (values['fazai:orders']) setPedidos(JSON.parse(values['fazai:orders']));
      if (values['fazai:needs']) setNecessidades(JSON.parse(values['fazai:needs']));
      if (values['fazai:published-services']) setServicosPublicados(JSON.parse(values['fazai:published-services']));
    }).catch(() => {});
  }, []);

  function persist(key, value) { AsyncStorage.setItem(key, String(value)).catch(() => {}); }
  function alternarDarkMode() { setDarkMode((value) => { persist('fazai:dark', !value); return !value; }); }
  function alternarContraste() { setAltoContraste((value) => { persist('fazai:contrast', !value); return !value; }); }
  function alterarEscala(value) { const next = Math.min(1.25, Math.max(0.9, value)); setTextScale(next); persist('fazai:textScale', next); }
  function salvarPedidos(next) { setPedidos(next); persist('fazai:orders', JSON.stringify(next)); }
  function criarPedido(pedido) { salvarPedidos([{ ...pedido, id: `pedido-${Date.now()}`, status: 'aguardando_pagamento', criadoEm: new Date().toISOString() }, ...pedidos]); }
  function atualizarPedido(id, patch) { salvarPedidos(pedidos.map((pedido) => pedido.id === id ? { ...pedido, ...patch } : pedido)); }
  function criarNecessidade(necessidade) { const next = [{ ...necessidade, id: `necessidade-${Date.now()}`, criadoEm: new Date().toISOString(), status: 'aberta' }, ...necessidades]; setNecessidades(next); persist('fazai:needs', JSON.stringify(next)); }
  function publicarServico(servico) { const next = [{ ...servico, id: `servico-${Date.now()}`, criadoEm: new Date().toISOString(), status: 'ativo' }, ...servicosPublicados]; setServicosPublicados(next); persist('fazai:published-services', JSON.stringify(next)); }
  function marcarPrestador(valor) { setPrestadorAtivo(Boolean(valor)); }

  const colors = useMemo(() => {
    const base = palettes[darkMode ? 'dark' : 'light'];
    return altoContraste ? { ...base, background: darkMode ? '#000000' : '#FFFFFF', surface: darkMode ? '#080808' : '#FFFFFF', text: '#FFFFFF', muted: '#FFFFFF', border: '#FFFFFF' } : base;
  }, [darkMode, altoContraste]);
  const value = useMemo(() => ({ darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo, alternarDarkMode, alternarContraste, alterarEscala, criarPedido, atualizarPedido, criarNecessidade, publicarServico, marcarPrestador }), [darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa ser usado dentro de AppProvider');
  return context;
}
