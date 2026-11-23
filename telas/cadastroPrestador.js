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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, firebaseConfigurado } from '../firebase';
import { salvarDadosContato } from '../dados/perfilUsuario';
import Logo from '../componentes/Logo';
import CampoEnderecoCep from '../componentes/CampoEnderecoCep';
import { useApp } from '../context/AppContext';

function celularValido(valor) {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 10 && digitos.length <= 13;
}

export default function CadastroPrestador() {
  const navigation = useNavigation();
  const { colors, textScale, marcarPrestador } = useApp();
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cidade, setCidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const styles = makeStyles(colors, textScale);

  async function enviar() {
    if (!firebaseConfigurado) {
      mostrarFeedback('Confira seus dados', 'Configure o Firebase para ativar o cadastro.', 'erro');
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      mostrarFeedback('Confira seus dados', 'Digite um e-mail válido, como voce@email.com.', 'erro');
      return;
    }
    if (senha.length < 8) {
      mostrarFeedback('Confira seus dados', 'A senha precisa ter pelo menos 8 caracteres.', 'erro');
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
      const credencial = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
      await updateProfile(credencial.user, { displayName: nome.trim() });
      await salvarDadosContato(credencial.user.uid, { endereco, celular });
      await AsyncStorage.setItem(`fazai:provider:${credencial.user.uid}`, JSON.stringify({
        tipo: 'prestador',
        categoria: categoria.trim(),
        cidade: cidade.trim(),
        descricao: descricao.trim(),
      }));
      marcarPrestador(true);
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        mostrarFeedback('Confira seus dados', 'Este e-mail já está cadastrado. Tente entrar.', 'erro');
      } else if (error?.code === 'auth/invalid-email') {
        mostrarFeedback('Confira seus dados', 'Digite um e-mail válido.', 'erro');
      } else if (error?.code === 'auth/weak-password') {
        mostrarFeedback('Confira seus dados', 'A senha precisa ter pelo menos 8 caracteres.', 'erro');
      } else if (error?.code === 'auth/network-request-failed') {
        mostrarFeedback('Confira seus dados', 'Não foi possível conectar. Verifique sua internet.', 'erro');
      } else {
        mostrarFeedback('Confira seus dados', 'Não foi possível criar o perfil. Confira os dados e tente novamente.', 'erro');
      }
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
          onChangeText={(texto) => { setValue(texto); mostrarFeedback('Confira seus dados', '', 'erro'); }}
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
          <Text style={styles.titulo}>Crie seu perfil de prestador.</Text>
          <Text style={styles.descricao}>Mostre seu trabalho, receba pedidos e construa sua reputação no FazAí.</Text>
          {campo('Seu nome ou negócio', 'Ex.: Dani Oliveira', nome, setNome, { autoCapitalize: 'words', textContentType: 'name' })}
          <CampoEnderecoCep onChangeText={setEndereco} />
          {campo('Seu celular com DDD', '(11) 91234-5678', celular, setCelular, { keyboardType: 'phone-pad', textContentType: 'telephoneNumber' })}
          {campo('Seu e-mail', 'voce@email.com', email, setEmail, { keyboardType: 'email-address', autoCapitalize: 'none', textContentType: 'emailAddress' })}
          {campo('Senha', 'Pelo menos 8 caracteres', senha, setSenha, { secureTextEntry: true, textContentType: 'newPassword' })}
          {campo('Especialidade', 'Ex.: limpeza residencial', categoria, setCategoria)}
          {campo('Cidade onde atende', 'Ex.: São Paulo, SP', cidade, setCidade, { autoCapitalize: 'words' })}
          {campo('Sobre seu trabalho', 'Conte brevemente sua experiência', descricao, setDescricao, { multiline: true })}
          <Pressable accessibilityRole="button" onPress={enviar} disabled={enviando} style={[styles.botao, enviando && styles.botaoDesativado]}>
            <Text style={styles.botaoTexto}>{enviando ? 'Criando perfil...' : 'Criar perfil de prestador  →'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.voltar}>
            <Text style={styles.voltarTexto}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style={colors.background === '#1C100A' ? 'light' : 'dark'} />
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
  mensagem: { marginTop: 16, color: c.coral, fontSize: 13 * scale, lineHeight: 19 * scale },
  botao: { minHeight: 54, alignItems: 'center', justifyContent: 'center', marginTop: 22, borderRadius: 14, backgroundColor: c.lime },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: '#3A2418', fontSize: 14 * scale, fontWeight: '900' },
  voltar: { alignItems: 'center', padding: 16 },
  voltarTexto: { color: c.primary, fontSize: 13 * scale, fontWeight: '800' },
});
