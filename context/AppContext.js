import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

const palettes = {
  light: { background: '#F7F7F5', surface: '#FFFFFF', surfaceMuted: '#F0F1EE', text: '#232323', logoText: '#000000', muted: '#6E706D', border: '#D9DAD6', primary: '#D7353A', primaryText: '#FFFFFF', lime: '#E7B34A', coral: '#E86A45', warning: '#B85C28', tab: '#FFFFFF', input: '#FBFBFA' },
  dark: { background: '#171717', surface: '#242424', surfaceMuted: '#333333', text: '#F5F5F3', logoText: '#F5F5F3', muted: '#B9BAB5', border: '#4A4A47', primary: '#F05A5F', primaryText: '#2A1010', lime: '#D9A33A', coral: '#FF8A66', warning: '#D9A33A', tab: '#202020', input: '#2D2D2D' },
};

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [pedidos, setPedidos] = useState([]);
  const [necessidades, setNecessidades] = useState([]);
  const [servicosPublicados, setServicosPublicados] = useState([]);
  const [prestadorAtivo, setPrestadorAtivo] = useState(false);
  const prestadorVersionRef = useRef(0);
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
  async function publicarServico(servico) {
    const anuncio = {
      ...servico,
      id: `servico-${Date.now()}`,
      criadoEm: new Date().toISOString(),
      status: 'ativo',
    };
    const next = [anuncio, ...servicosPublicados];
    await AsyncStorage.setItem('fazai:published-services', JSON.stringify(next));
    setServicosPublicados(next);
    return anuncio;
  }
  function marcarPrestador(valor) {
    prestadorVersionRef.current += 1;
    setPrestadorAtivo(Boolean(valor));
  }
  function mostrarFeedback(titulo, mensagem, tipo = 'info', confirmar = null) { setFeedback({ titulo, mensagem, tipo, confirmar }); }
  function fecharFeedback() { setFeedback(null); }

  const colors = useMemo(() => {
    const base = palettes[darkMode ? 'dark' : 'light'];
    return altoContraste ? { ...base, background: darkMode ? '#000000' : '#FFFFFF', surface: darkMode ? '#080808' : '#FFFFFF', text: '#FFFFFF', muted: '#FFFFFF', border: '#FFFFFF' } : base;
  }, [darkMode, altoContraste]);
  const value = useMemo(() => ({ darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo, prestadorVersionRef, feedback, alternarDarkMode, alternarContraste, alterarEscala, criarPedido, atualizarPedido, criarNecessidade, publicarServico, marcarPrestador, mostrarFeedback, fecharFeedback }), [darkMode, altoContraste, textScale, colors, pedidos, necessidades, servicosPublicados, prestadorAtivo, feedback]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa ser usado dentro de AppProvider');
  return context;
}
