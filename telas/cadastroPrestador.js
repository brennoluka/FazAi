import { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firebaseConfigurado } from '../firebase';
import { carregarDadosContato, salvarDadosContato } from '../dados/perfilUsuario';
import Logo from '../componentes/Logo';
import CampoEnderecoCep from '../componentes/CampoEnderecoCep';
import { useApp } from '../context/AppContext';

function celularValido(valor) {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 10 && digitos.length <= 13;
}

function mensagemDeErro(error) {
  if (['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'].includes(error?.code)) {
    return 'Esta conta já existe. Confira a senha da conta para entrar e ativar o perfil de prestador.';
  }
  if (error?.code === 'auth/email-already-in-use') {
    return 'Este e-mail já tem uma conta. Entre com ela para criar o perfil de prestador.';
  }
  if (error?.code === 'auth/invalid-email') return 'Digite um e-mail válido.';
  if (error?.code === 'auth/weak-password') return 'A senha precisa ter pelo menos 8 caracteres.';
  if (error?.code === 'auth/network-request-failed') return 'Não foi possível conectar. Verifique sua internet.';
  if (error?.code === 'auth/operation-not-allowed') return 'Ative o provedor E-mail/senha no Firebase Authentication.';
  if (error?.code === 'auth/too-many-requests') return 'O Firebase bloqueou temporariamente novas tentativas. Aguarde alguns minutos.';
  return error?.message || 'Confira os dados e tente novamente.';
}

export default function CadastroPrestador() {
  const navigation = useNavigation();
  const { colors, textScale, marcarPrestador, mostrarFeedback } = useApp();
  const contaConectadaInicial = auth?.currentUser;
  const [nome, setNome] = useState(contaConectadaInicial?.displayName || '');
  const [endereco, setEndereco] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState(contaConectadaInicial?.email || '');
  const [senha, setSenha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const styles = makeStyles(colors, textScale);
  const emailNormalizado = email.trim().toLowerCase();
  const emailDaContaConectada = contaConectadaInicial?.email?.trim().toLowerCase();
  const usandoContaConectada = Boolean(emailDaContaConectada && emailDaContaConectada === emailNormalizado);

  useEffect(() => {
    let ativo = true;
    if (contaConectadaInicial?.uid) {
      carregarDadosContato(contaConectadaInicial.uid).then((dados) => {
        if (!ativo || !dados) return;
        setEndereco(dados.endereco || '');
        setCelular(dados.celular || '');
      });
    }
    return () => { ativo = false; };
  }, []);

  async function enviar() {
    if (enviando) return;
    if (!firebaseConfigurado || !auth) {
      mostrarFeedback('Cadastro indisponível', 'Configure o Firebase para ativar o cadastro.', 'erro');
      return;
    }
    if (!nome.trim()) {
      mostrarFeedback('Confira seus dados', 'Informe seu nome ou o nome do seu negócio.', 'erro');
      return;
    }
    if (!endereco.trim()) {
      mostrarFeedback('Confira seus dados', 'Informe seu endereço completo.', 'erro');
      return;
    }
    if (!celularValido(celular)) {
      mostrarFeedback('Confira seus dados', 'Digite um número de celular válido com DDD.', 'erro');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      mostrarFeedback('Confira seus dados', 'Digite um e-mail válido, como voce@email.com.', 'erro');
      return;
    }
    if (!usandoContaConectada && senha.length < 8) {
      mostrarFeedback('Confira seus dados', 'Digite a senha da conta ou crie uma senha com pelo menos 8 caracteres.', 'erro');
      return;
    }
    if (!categoria.trim()) {
      mostrarFeedback('Confira seus dados', 'Informe qual serviço você oferece.', 'erro');
      return;
    }
    if (!cidade.trim()) {
      mostrarFeedback('Confira seus dados', 'Informe a cidade onde você atende.', 'erro');
      return;
    }

    setEnviando(true);
    try {
      let usuarioConta = null;
      const contaAtual = auth.currentUser;
      if (contaAtual) {
        if (contaAtual.email?.trim().toLowerCase() !== emailNormalizado) {
          mostrarFeedback('Use a conta conectada', `Você já está conectado como ${contaAtual.email}. Use esse e-mail para adicionar o perfil de prestador ou saia antes de criar outra conta.`, 'info');
          return;
        }
        usuarioConta = contaAtual;
      } else {
        try {
          const credencial = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
          usuarioConta = credencial.user;
        } catch (errorCriacao) {
          if (errorCriacao?.code !== 'auth/email-already-in-use') throw errorCriacao;
          const credencial = await signInWithEmailAndPassword(auth, emailNormalizado, senha);
          usuarioConta = credencial.user;
        }
      }

      if (usuarioConta.displayName !== nome.trim()) {
        await updateProfile(usuarioConta, { displayName: nome.trim() });
      }
      await salvarDadosContato(usuarioConta.uid, { endereco, celular });
      await AsyncStorage.setItem(`fazai:provider:${usuarioConta.uid}`, JSON.stringify({
        tipo: 'prestador',
        categoria: categoria.trim(),
        cidade: cidade.trim(),
        descricao: descricao.trim(),
      }));
      marcarPrestador(true);

      if (usuarioConta.emailVerified) {
        mostrarFeedback('Perfil de prestador ativado', 'Sua conta agora tem uma página profissional. Você já pode criar e publicar seus anúncios.', 'sucesso');
        navigation.navigate('Principal', { screen: 'Perfil' });
      }
      // Contas ainda não confirmadas seguem para a tela de verificação, que envia o link.
    } catch (error) {
      mostrarFeedback('Não foi possível ativar o perfil', mensagemDeErro(error), 'erro');
    } finally {
      setEnviando(false);
    }
  }

  function campo(label, placeholder, value, setValue, opcoes = {}) {
    return (
      <View style={styles.grupo}>
        <Text style={styles.rotulo}>{label}</Text>
        <TextInput
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={setValue}
          style={[styles.input, opcoes.multiline && styles.textarea]}
          multiline={Boolean(opcoes.multiline)}
          textAlignVertical={opcoes.multiline ? 'top' : 'center'}
          {...opcoes}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Logo />
          <Text style={styles.eyebrow}>PARA QUEM FAZ ACONTECER</Text>
          <Text style={styles.titulo}>{contaConectadaInicial ? 'Ative seu perfil profissional.' : 'Crie seu perfil de prestador.'}</Text>
          <Text style={styles.descricao}>
            {contaConectadaInicial
              ? 'Vamos adicionar os dados profissionais à sua conta atual, sem criar outro usuário.'
              : 'Se você já tem conta, use o mesmo e-mail e senha para vinculá-la como prestador.'}
          </Text>
          {campo('Seu nome ou negócio', 'Ex.: Dani Oliveira', nome, setNome, { autoCapitalize: 'words', textContentType: 'name' })}
          <CampoEnderecoCep onChangeText={setEndereco} />
          {campo('Seu celular com DDD', '(11) 91234-5678', celular, setCelular, { keyboardType: 'phone-pad', textContentType: 'telephoneNumber' })}
          {campo('E-mail da conta', 'voce@email.com', email, setEmail, { keyboardType: 'email-address', autoCapitalize: 'none', textContentType: 'emailAddress', editable: !contaConectadaInicial?.email })}
          {usandoContaConectada
            ? <Text style={styles.notaConta}>Usaremos sua conta já conectada; não é preciso informar a senha novamente.</Text>
            : campo('Senha da conta', 'Senha da conta existente ou nova senha', senha, setSenha, { secureTextEntry: true, textContentType: 'password' })}
          {campo('Especialidade', 'Ex.: limpeza residencial', categoria, setCategoria)}
          {campo('Cidade onde atende', 'Ex.: São Paulo, SP', cidade, setCidade, { autoCapitalize: 'words' })}
          {campo('Sobre seu trabalho', 'Conte brevemente sua experiência', descricao, setDescricao, { multiline: true })}
          <Pressable accessibilityRole="button" onPress={enviar} disabled={enviando} style={[styles.botao, enviando && styles.botaoDesativado]}>
            <Text style={styles.botaoTexto}>{enviando ? 'Salvando perfil...' : contaConectadaInicial ? 'Ativar perfil de prestador  →' : 'Criar ou vincular perfil  →'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.voltar}>
            <Text style={styles.voltarTexto}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style={colors.background === '#171717' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  flex: { flex: 1 },
  tela: { flex: 1, backgroundColor: c.background },
  conteudo: { flexGrow: 1, padding: 22, paddingBottom: 35 },
  eyebrow: { marginTop: 28, color: c.coral, fontSize: 11 * scale, fontWeight: '900', letterSpacing: 1.1 },
  titulo: { marginTop: 8, color: c.text, fontSize: 28 * scale, lineHeight: 34 * scale, fontWeight: '900' },
  descricao: { marginTop: 8, color: c.muted, fontSize: 14 * scale, lineHeight: 21 * scale },
  grupo: { marginTop: 18 },
  rotulo: { marginBottom: 7, color: c.text, fontSize: 12 * scale, fontWeight: '800' },
  input: { minHeight: 50, paddingHorizontal: 13, borderWidth: 1, borderColor: c.border, borderRadius: 12, color: c.text, backgroundColor: c.surface, fontSize: 14 * scale },
  textarea: { minHeight: 86, paddingTop: 13 },
  notaConta: { marginTop: 9, color: c.muted, fontSize: 11 * scale, lineHeight: 16 * scale },
  botao: { minHeight: 54, alignItems: 'center', justifyContent: 'center', marginTop: 22, borderRadius: 14, backgroundColor: c.lime },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: '#232323', fontSize: 14 * scale, fontWeight: '900' },
  voltar: { alignItems: 'center', padding: 16 },
  voltarTexto: { color: c.primary, fontSize: 13 * scale, fontWeight: '800' },
});
