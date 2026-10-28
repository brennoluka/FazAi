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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, firebaseConfigurado } from '../firebase';

const cores = {
  fundo: '#FBFCF6',
  verde: '#1D4636',
  texto: '#203A30',
  apoio: '#7D8980',
  borda: '#E5EAE2',
  lima: '#D5FA75',
  coral: '#EF7655',
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

export default function Autenticacao({ modo = 'login' }) {
  const navigation = useNavigation();
  const cadastro = modo === 'cadastro';
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setMensagem('');
    const emailNormalizado = email.trim().toLowerCase();
    if (!firebaseConfigurado) {
      setMensagem('Configure as variáveis do Firebase no arquivo .env.local para ativar o acesso.');
      return;
    }
    if (cadastro && !nome.trim()) {
      setMensagem('Digite seu nome para continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setMensagem('Digite um e-mail válido.');
      return;
    }
    if (senha.length < 8) {
      setMensagem('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (cadastro && senha !== confirmacao) {
      setMensagem('As senhas não coincidem. Confira e tente de novo.');
      return;
    }

    setEnviando(true);
    try {
      if (cadastro) {
        const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
        await updateProfile(credencial.user, { displayName: nome.trim() });
      } else {
        await signInWithEmailAndPassword(auth, emailNormalizado, senha);
      }
      navigation.navigate('Principal', { screen: 'Perfil' });
    } catch (erro) {
      setMensagem(mensagemDoFirebase(erro));
    } finally {
      setEnviando(false);
    }
  }

  function campo(label, placeholder, value, setValue, opcoes = {}) {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{label}</Text>
        <View style={styles.campoLinha}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#9AA49B"
            value={value}
            onChangeText={(texto) => { setValue(texto); setMensagem(''); }}
            autoCapitalize={opcoes.autoCapitalize || 'none'}
            autoCorrect={false}
            keyboardType={opcoes.keyboardType || 'default'}
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
    <SafeAreaView style={styles.tela}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.topo}>
            <Pressable onPress={() => navigation.navigate('Principal')} accessibilityRole="button" accessibilityLabel="Voltar ao início">
              <Text style={styles.marca}>faz<Text style={styles.coral}>aí.</Text></Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Principal')} style={styles.voltar}>
              <Text style={styles.voltarTexto}>‹  Início</Text>
            </Pressable>
          </View>
          <View style={styles.cartao}>
            <Text style={styles.sobretitulo}>{cadastro ? 'CRIE SUA CONTA' : 'ACESSO À SUA CONTA'}</Text>
            <Text style={styles.titulo}>{cadastro ? 'Crie sua conta.' : 'Que bom ter você por aqui.'}</Text>
            <Text style={styles.descricao}>{cadastro ? 'Cadastre-se para encontrar serviços e profissionais no FazAí.' : 'Entre para continuar no FazAí.'}</Text>
            {cadastro && campo('Seu nome', 'Como podemos chamar você?', nome, setNome, { autoCapitalize: 'words', textContentType: 'name' })}
            {campo('Seu e-mail', 'voce@email.com', email, setEmail, { keyboardType: 'email-address', textContentType: 'emailAddress' })}
            {campo('Sua senha', cadastro ? 'Crie uma senha com 8 caracteres' : 'Digite sua senha', senha, setSenha, { senha: true, textContentType: cadastro ? 'newPassword' : 'password' })}
            {cadastro && campo('Confirme sua senha', 'Digite a senha novamente', confirmacao, setConfirmacao, { senha: true, textContentType: 'newPassword', returnKeyType: 'done' })}
            {mensagem ? <Text style={styles.mensagem} accessibilityLiveRegion="polite">{mensagem}</Text> : null}
            <Pressable style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado, enviando && styles.botaoDesativado]} onPress={enviar} disabled={enviando} accessibilityRole="button">
              <Text style={styles.botaoTexto}>{enviando ? 'Aguarde...' : cadastro ? 'Criar minha conta' : 'Entrar'}{!enviando ? '  →' : ''}</Text>
            </Pressable>
            <View style={styles.rodapeConta}>
              <Text style={styles.rodapeTexto}>{cadastro ? 'Já tem uma conta? ' : 'Ainda não tem conta? '}</Text>
              <Pressable onPress={() => navigation.navigate(cadastro ? 'Entrar' : 'Cadastro')}>
                <Text style={styles.link}>{cadastro ? 'Entrar' : 'Cadastre-se'}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.nota}>Seus dados, sempre em boas mãos.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: { minHeight: 46, flex: 1, color: cores.texto, fontSize: 14, outlineStyle: 'none' },
  verSenha: { paddingHorizontal: 4, paddingVertical: 10 },
  verSenhaTexto: { color: cores.verde, fontSize: 12, fontWeight: '700' },
  mensagem: { marginBottom: 12, color: '#B94D35', fontSize: 13, lineHeight: 19 },
  botao: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 5, borderRadius: 12, backgroundColor: cores.lima },
  botaoPressionado: { opacity: 0.82 },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: cores.texto, fontSize: 15, fontWeight: '800' },
  rodapeConta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: 19 },
  rodapeTexto: { color: cores.apoio, fontSize: 13 },
  link: { color: cores.verde, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
  nota: { alignSelf: 'center', marginTop: 18, color: '#9AA49B', fontSize: 11 },
});
