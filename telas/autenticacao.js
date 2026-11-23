import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, firebaseConfigurado } from '../firebase';
import Logo from '../componentes/Logo';
import CampoEnderecoCep from '../componentes/CampoEnderecoCep';
import { useApp } from '../context/AppContext';
import { salvarDadosContato } from '../dados/perfilUsuario';

const cores = {
  fundo: '#FFF7F2',
  verde: '#E6292E',
  texto: '#21130F',
  apoio: '#7D6258',
  borda: '#F4C8B8',
  lima: '#FFB13B',
  coral: '#F56A2A',
};

function mensagemDoFirebase(erro) {
  const mensagens = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/user-not-found': 'E-mail ou senha incorretos.',
    'auth/wrong-password': 'E-mail ou senha incorretos.',
    'auth/weak-password': 'A senha precisa ter pelo menos 8 caracteres.',
    'auth/network-request-failed': 'Não foi possível conectar. Verifique sua internet.',
  };
  return mensagens[erro?.code] || 'Não foi possível concluir. Confira os dados e tente novamente.';
}

function celularValido(valor) {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 10 && digitos.length <= 13;
}

export default function Autenticacao({ modo = 'login' }) {
  const navigation = useNavigation();
  const { colors, darkMode, textScale, mostrarFeedback } = useApp();
  const cadastro = modo === 'cadastro';
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [recuperacaoAberta, setRecuperacaoAberta] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);

  async function enviar() {
    const emailNormalizado = email.trim().toLowerCase();
    if (!firebaseConfigurado) {
      mostrarFeedback('Firebase não configurado', 'Configure as variáveis do Firebase no arquivo .env.local para ativar o acesso.', 'erro');
      return;
    }
    if (cadastro && !nome.trim()) {
      mostrarFeedback('Confira seus dados', 'Digite seu nome para continuar.', 'erro');
      return;
    }
    if (cadastro && !endereco.trim()) {
      mostrarFeedback('Confira seus dados', 'Informe seu endereço completo.', 'erro');
      return;
    }
    if (cadastro && !celularValido(celular)) {
      mostrarFeedback('Confira seus dados', 'Digite um número de celular válido com DDD.', 'erro');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      mostrarFeedback('Confira seus dados', 'Digite um e-mail válido.', 'erro');
      return;
    }
    if (senha.length < 8) {
      mostrarFeedback('Confira sua senha', 'A senha precisa ter pelo menos 8 caracteres.', 'erro');
      return;
    }
    if (cadastro && senha !== confirmacao) {
      mostrarFeedback('Confira sua senha', 'As senhas não coincidem. Confira e tente de novo.', 'erro');
      return;
    }

    setEnviando(true);
    try {
      if (cadastro) {
        const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
        await updateProfile(credencial.user, { displayName: nome.trim() });
        await salvarDadosContato(credencial.user.uid, { endereco, celular });
      } else {
        const credencial = await signInWithEmailAndPassword(auth, emailNormalizado, senha);
        if (credencial.user.emailVerified) {
          navigation.navigate('Principal', { screen: 'Perfil' });
        }
      }
    } catch (erro) {
      mostrarFeedback('Não foi possível continuar', mensagemDoFirebase(erro), 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function recuperarSenha() {
    const emailNormalizado = emailRecuperacao.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      mostrarFeedback('E-mail inválido', 'Digite um e-mail válido para receber o link de redefinição.', 'erro'); return;
    }
    if (!firebaseConfigurado) { mostrarFeedback('Firebase não configurado', 'Configure as variáveis do Firebase no arquivo .env.local para ativar o acesso.', 'erro'); return; }
    setEnviandoRecuperacao(true);
    try { await sendPasswordResetEmail(auth, emailNormalizado); setRecuperacaoAberta(false); mostrarFeedback('E-mail enviado', 'Enviamos um link para redefinir sua senha. Verifique também a pasta de spam.', 'sucesso'); }
    catch (erro) { mostrarFeedback('Não foi possível enviar', mensagemDoFirebase(erro), 'erro'); }
    finally { setEnviandoRecuperacao(false); }
  }

  function campo(label, placeholder, value, setValue, opcoes = {}) {
    return (
      <View style={styles.grupo}>
        <Text style={[styles.rotulo, { color: colors.text, fontSize: 12 * textScale }]}>{label}</Text>
        <View style={[styles.campoLinha, opcoes.multiline && styles.campoLinhaMultiline, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, opcoes.multiline && styles.inputMultiline, { color: colors.text, fontSize: 14 * textScale }]}
            placeholder={placeholder}
            placeholderTextColor="#B58A7A"
            value={value}
            onChangeText={setValue}
            autoCapitalize={opcoes.autoCapitalize || 'none'}
            autoCorrect={false}
            keyboardType={opcoes.keyboardType || 'default'}
            multiline={Boolean(opcoes.multiline)}
            textAlignVertical={opcoes.multiline ? 'top' : 'center'}
            secureTextEntry={Boolean(opcoes.senha) && !mostrarSenha}
            textContentType={opcoes.textContentType}
            accessibilityLabel={label}
            returnKeyType={opcoes.returnKeyType || 'next'}
          />
          {opcoes.senha && (
            <Pressable style={styles.verSenha} onPress={() => setMostrarSenha((valor) => !valor)} accessibilityRole="button" accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              <Text style={styles.verSenhaTexto}>{mostrarSenha ? 'Ocultar' : 'Ver'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.tela, { backgroundColor: colors.background }]}>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topo}>
            <Pressable onPress={() => navigation.navigate('Principal')} accessibilityRole="button" accessibilityLabel="Voltar ao início">
              <Logo compact />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Principal')} style={styles.voltar}>
              <Text style={styles.voltarTexto}>‹  Início</Text>
            </Pressable>
          </View>
          <View style={[styles.cartao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sobretitulo, { color: colors.muted, fontSize: 10 * textScale }]}>{cadastro ? 'CRIE SUA CONTA' : 'ACESSO À SUA CONTA'}</Text>
            <Text style={[styles.titulo, { color: colors.text, fontSize: 27 * textScale }]}>{cadastro ? 'Crie sua conta.' : 'Que bom ter você por aqui.'}</Text>
            <Text style={[styles.descricao, { color: colors.muted, fontSize: 14 * textScale }]}>{cadastro ? 'Cadastre-se para encontrar serviços e profissionais no FazAí.' : 'Entre para continuar no FazAí.'}</Text>
            {cadastro && campo('Seu nome', 'Como podemos chamar você?', nome, setNome, { autoCapitalize: 'words', textContentType: 'name' })}
            {cadastro && <CampoEnderecoCep onChangeText={setEndereco} />}
            {cadastro && campo('Seu celular com DDD', '(11) 91234-5678', celular, setCelular, { keyboardType: 'phone-pad', textContentType: 'telephoneNumber' })}
            {campo('Seu e-mail', 'voce@email.com', email, setEmail, { keyboardType: 'email-address', textContentType: 'emailAddress' })}
            {campo('Sua senha', cadastro ? 'Crie uma senha com 8 caracteres' : 'Digite sua senha', senha, setSenha, { senha: true, textContentType: cadastro ? 'newPassword' : 'password' })}
            {cadastro && campo('Confirme sua senha', 'Digite a senha novamente', confirmacao, setConfirmacao, { senha: true, textContentType: 'newPassword', returnKeyType: 'done' })}
            <Pressable style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado, enviando && styles.botaoDesativado]} onPress={enviar} disabled={enviando} accessibilityRole="button">
              <Text style={styles.botaoTexto}>{enviando ? 'Aguarde...' : cadastro ? 'Criar minha conta' : 'Entrar'}{!enviando ? '  →' : ''}</Text>
            </Pressable>
            {!cadastro && <Pressable onPress={() => { setEmailRecuperacao(email); setRecuperacaoAberta(true); }} style={styles.esqueci}><Text style={[styles.link, { color: colors.primary }]}>Esqueci minha senha</Text></Pressable>}
            <View style={styles.rodapeConta}>
              <Text style={styles.rodapeTexto}>{cadastro ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}</Text>
              <Pressable onPress={() => navigation.navigate(cadastro ? 'Entrar' : 'Cadastro')}>
                <Text style={styles.link}>{cadastro ? 'Entrar' : 'Cadastre-se'}</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('CadastroPrestador')} style={styles.prestadorLink}>
              <Text style={[styles.link, { color: colors.primary }]}>Quero oferecer serviços</Text>
            </Pressable>
          </View>
          <Text style={styles.nota}>Seus dados, sempre em boas mãos.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={recuperacaoAberta} transparent animationType="slide" onRequestClose={() => setRecuperacaoAberta(false)}>
        <View style={styles.fundoRecuperacao}><View style={[styles.cartaoRecuperacao, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.tituloRecuperacao, { color: colors.text }]}>Redefina sua senha</Text><Text style={[styles.descricaoRecuperacao, { color: colors.muted }]}>Informe seu e-mail e enviaremos um link seguro para criar uma nova senha.</Text>
          <TextInput value={emailRecuperacao} onChangeText={setEmailRecuperacao} placeholder="voce@email.com" placeholderTextColor="#B58A7A" keyboardType="email-address" autoCapitalize="none" style={[styles.inputRecuperacao, { color: colors.text, borderColor: colors.border, backgroundColor: colors.input }]} accessibilityLabel="E-mail para recuperação" />
          <View style={styles.acoesRecuperacao}><Pressable onPress={() => setRecuperacaoAberta(false)} style={[styles.cancelarRecuperacao, { borderColor: colors.border }]}><Text style={{ color: colors.text, fontWeight: '800' }}>Cancelar</Text></Pressable><Pressable onPress={recuperarSenha} disabled={enviandoRecuperacao} style={[styles.enviarRecuperacao, { backgroundColor: colors.lime }]}><Text style={styles.enviarRecuperacaoTexto}>{enviandoRecuperacao ? 'Enviando...' : 'Enviar link'}</Text></Pressable></View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tela: { flex: 1, backgroundColor: cores.fundo },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 28 },
  topo: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingTop: 14, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marca: { color: cores.verde, fontSize: 29, fontWeight: '800', letterSpacing: -1.3 },
  coral: { color: cores.coral },
  voltar: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  voltarTexto: { color: cores.verde, fontSize: 14, fontWeight: '700' },
  cartao: { width: '100%', maxWidth: 480, alignSelf: 'center', marginTop: 18, padding: 24, borderWidth: 1, borderColor: cores.borda, borderRadius: 20, backgroundColor: '#FFFFFF' },
  sobretitulo: { marginBottom: 10, color: cores.apoio, fontSize: 10, fontWeight: '800', letterSpacing: 1.15 },
  titulo: { color: cores.texto, fontSize: 27, lineHeight: 33, fontWeight: '800', letterSpacing: -0.65, textAlign: 'center' },
  descricao: { marginTop: 8, marginBottom: 20, color: cores.apoio, fontSize: 14, lineHeight: 21 },
  grupo: { marginBottom: 14 },
  rotulo: { marginBottom: 7, color: cores.texto, fontSize: 12, fontWeight: '700' },
  campoLinha: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderWidth: 1, borderColor: cores.borda, borderRadius: 11, backgroundColor: '#FFFFFF' },
  campoLinhaMultiline: { minHeight: 84, alignItems: 'flex-start', paddingVertical: 11 },
  input: { minHeight: 46, flex: 1, color: cores.texto, fontSize: 14, outlineStyle: 'none' },
  inputMultiline: { minHeight: 62, paddingTop: 0, textAlignVertical: 'top' },
  verSenha: { paddingHorizontal: 4, paddingVertical: 10 },
  verSenhaTexto: { color: cores.verde, fontSize: 12, fontWeight: '700' },
  esqueci: { alignItems: 'center', paddingTop: 16 },
  fundoRecuperacao: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(40, 8, 8, 0.62)' },
  cartaoRecuperacao: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1 },
  tituloRecuperacao: { fontSize: 22, fontWeight: '900' }, descricaoRecuperacao: { marginTop: 8, lineHeight: 20 },
  inputRecuperacao: { minHeight: 50, marginTop: 18, paddingHorizontal: 14, borderWidth: 1, borderRadius: 11, fontSize: 15 }, acoesRecuperacao: { flexDirection: 'row', gap: 10, marginTop: 18 },
  cancelarRecuperacao: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12 }, enviarRecuperacao: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, enviarRecuperacaoTexto: { color: '#21130F', fontWeight: '900' },
  botao: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 5, borderRadius: 12, backgroundColor: cores.lima },
  botaoPressionado: { opacity: 0.82 },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: cores.texto, fontSize: 15, fontWeight: '800' },
  rodapeConta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 19 },
  rodapeTexto: { color: cores.apoio, fontSize: 13 },
  link: { color: cores.verde, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
  prestadorLink: { alignItems: 'center', paddingTop: 16 },
  nota: { alignSelf: 'center', marginTop: 18, color: '#B58A7A', fontSize: 11 },
});
