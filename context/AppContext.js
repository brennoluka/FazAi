import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const palettes = {
  light: { background: '#FFF7F2', surface: '#FFFFFF', surfaceMuted: '#FFE3D6', text: '#21130F', logoText: '#000000', muted: '#7D6258', border: '#F4C8B8', primary: '#E6292E', primaryText: '#FFFFFF', lime: '#FFB13B', coral: '#F56A2A', warning: '#C94A20', tab: '#FFFFFF', input: '#FFFAF8' },
  dark: { background: '#1B0B0B', surface: '#321313', surfaceMuted: '#51201A', text: '#FFF4EF', logoText: '#FFF4EF', muted: '#E3B9A8', border: '#8C382B', primary: '#FF5A52', primaryText: '#3A0B0B', lime: '#FFC857', coral: '#FF8A3D', warning: '#FFC857', tab: '#271010', input: '#421818' },
};

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [necessidades, setNecessidades] = useState([]);
  const [servicosPublicados, setServicosPublicados] = useState([]);
  const [prestadorAtivo, setPrestadorAtivo] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
  function mostrarFeedback(titulo, mensagem, tipo = 'info', confirmar = null) { setFeedback({ titulo, mensagem, tipo, confirmar }); }
  function fecharFeedback() { setFeedback(null); }

  const colors = useMemo(() => {
    const base = palettes[darkMode ? 'dark' : 'light'];
    return altoContraste ? { ...base, background: darkMode ? '#000000' : '#FFFFFF', surface: darkMode ? '#080808' : '#FFFFFF', text: '#FFFFFF', muted: '#FFFFFF', border: '#FFFFFF' } : base;
  }, [darkMode, altoContraste]);
  const value = useMemo(() => ({ darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo, feedback, alternarDarkMode, alternarContraste, alterarEscala, criarPedido, atualizarPedido, criarNecessidade, publicarServico, marcarPrestador, mostrarFeedback, fecharFeedback }), [darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo, feedback]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa ser usado dentro de AppProvider');
  return context;
}
