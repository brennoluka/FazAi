import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { reload, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Logo from '../componentes/Logo';
import { useApp } from '../context/AppContext';

function mensagemErro(erro) {
  if (erro?.code === 'auth/too-many-requests') {
    return 'Muitas tentativas em pouco tempo. Aguarde um pouco antes de solicitar outro e-mail.';
  }
  if (erro?.code === 'auth/network-request-failed') {
    return 'Não foi possível conectar. Confira sua internet e tente novamente.';
  }
  return 'Não foi possível enviar a confirmação agora. Tente novamente em instantes.';
}

export default function VerificacaoEmail({ usuario, onVerificado }) {
  const { colors, darkMode, textScale, mostrarFeedback } = useApp();
  const estilos = makeStyles(colors, textScale);
  const uidEnviado = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [checando, setChecando] = useState(false);
  const [erro, setErro] = useState(false);

  async function enviarLink() {
    const usuarioAtual = auth?.currentUser || usuario;
    if (!usuarioAtual) {
      setErro(true);
      mostrarFeedback('Verificação de e-mail', 'Sua sessão expirou. Entre novamente para continuar.', 'info');
      return;
    }

    setEnviando(true);
    setErro(false);
    try {
      auth.languageCode = 'pt-BR';
      await sendEmailVerification(usuarioAtual);
      mostrarFeedback('Verificação de e-mail', `Enviamos um link de confirmação para ${usuarioAtual.email}. Confira também a pasta de spam.`, 'info');
    } catch (erroEnvio) {
      setErro(true);
      mostrarFeedback('Verificação de e-mail', mensagemErro(erroEnvio), 'info');
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    if (!usuario?.uid || uidEnviado.current === usuario.uid) return;
    uidEnviado.current = usuario.uid;
    enviarLink();
  }, [usuario?.uid]);

  async function verificarEmail() {
    const usuarioAtual = auth?.currentUser;
    if (!usuarioAtual) {
      setErro(true);
      mostrarFeedback('Verificação de e-mail', 'Sua sessão expirou. Entre novamente para continuar.', 'info');
      return;
    }

    setChecando(true);
    setErro(false);
    try {
      await reload(usuarioAtual);
      if (usuarioAtual.emailVerified) {
        onVerificado();
      } else {
        mostrarFeedback('Verificação de e-mail', 'Ainda não encontramos a confirmação. Abra o link enviado ao seu e-mail e tente novamente.', 'info');
      }
    } catch (erroConsulta) {
      setErro(true);
      mostrarFeedback('Verificação de e-mail', mensagemErro(erroConsulta), 'info');
    } finally {
      setChecando(false);
    }
  }

  async function sair() {
    try {
      await signOut(auth);
    } catch (_erro) {
      setErro(true);
      mostrarFeedback('Verificação de e-mail', 'Não foi possível sair agora. Tente novamente.', 'info');
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={estilos.conteudo}>
        <Logo />
        <View style={estilos.icone}><Text style={estilos.iconeTexto}>✉</Text></View>
        <Text style={estilos.titulo}>Confirme seu e-mail</Text>
        <Text style={estilos.descricao}>
          Para proteger sua conta, confirme o endereço de e-mail antes de usar o FazAí.
        </Text>
        <View style={estilos.cartao}>
          <Text style={estilos.rotulo}>LINK DE CONFIRMAÇÃO</Text>
          <Text style={estilos.email} selectable>{usuario?.email || 'E-mail da conta'}</Text>
          <Text style={estilos.instrucao}>
            Abra o link que enviamos. Depois, volte ao app e toque em “Já confirmei meu e-mail”.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={verificarEmail}
          disabled={checando || enviando}
          style={({ pressed }) => [estilos.botaoPrincipal, pressed && estilos.pressionado, (checando || enviando) && estilos.desativado]}
        >
          {checando ? <ActivityIndicator color="#21130F" /> : <Text style={estilos.botaoPrincipalTexto}>Já confirmei meu e-mail</Text>}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={enviarLink}
          disabled={enviando || checando}
          style={estilos.botaoSecundario}
        >
          <Text style={estilos.botaoSecundarioTexto}>{enviando ? 'Enviando...' : 'Reenviar link de confirmação'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={sair} style={estilos.botaoSair}>
          <Text style={estilos.botaoSairTexto}>Sair e tentar depois</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  tela: { flex: 1, backgroundColor: c.background },
  conteudo: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', padding: 24 },
  icone: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', marginTop: 28, marginBottom: 8, borderRadius: 36, backgroundColor: c.surfaceMuted },
  iconeTexto: { color: c.primary, fontSize: 30, fontWeight: '900' },
  titulo: { marginTop: 14, color: c.text, fontSize: 27 * scale, lineHeight: 34 * scale, fontWeight: '900', textAlign: 'center' },
  descricao: { maxWidth: 370, marginTop: 8, color: c.muted, fontSize: 14 * scale, lineHeight: 21 * scale, textAlign: 'center' },
  cartao: { width: '100%', maxWidth: 430, marginTop: 24, padding: 18, borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface },
  rotulo: { color: c.muted, fontSize: 10 * scale, fontWeight: '900', letterSpacing: 1 },
  email: { marginTop: 8, color: c.text, fontSize: 15 * scale, fontWeight: '800' },
  instrucao: { marginTop: 10, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
  mensagem: { maxWidth: 430, marginTop: 15, color: c.primary, fontSize: 12 * scale, lineHeight: 18 * scale, textAlign: 'center' },
  mensagemErro: { color: c.coral },
  botaoPrincipal: { minHeight: 52, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', maxWidth: 430, marginTop: 22, paddingHorizontal: 16, borderRadius: 12, backgroundColor: c.lime },
  botaoPrincipalTexto: { color: '#21130F', fontSize: 14 * scale, fontWeight: '900', textAlign: 'center' },
  botaoSecundario: { minHeight: 46, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', maxWidth: 430, marginTop: 6, paddingHorizontal: 14 },
  botaoSecundarioTexto: { color: c.primary, fontSize: 13 * scale, fontWeight: '800', textAlign: 'center' },
  botaoSair: { padding: 14 },
  botaoSairTexto: { color: c.muted, fontSize: 12 * scale, fontWeight: '700' },
  pressionado: { opacity: 0.78 },
  desativado: { opacity: 0.6 },
});
