import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const cores = {
  fundo: '#FBFCF6',
  verde: '#1D4636',
  texto: '#203A30',
  apoio: '#7D8980',
  borda: '#E5EAE2',
  lima: '#D5FA75',
  coral: '#EF7655',
};

function Logo() {
  return <Text style={styles.marca}>faz<Text style={styles.coral}>aí.</Text></Text>;
}

function LinhaInformacao({ rotulo, valor, ultima = false }) {
  return (
    <View style={[styles.linhaInformacao, ultima && styles.ultimaLinha]}>
      <Text style={styles.rotuloInformacao}>{rotulo}</Text>
      <Text style={styles.valorInformacao} selectable>{valor || 'Não informado'}</Text>
    </View>
  );
}

function formatarData(data) {
  if (!data) return 'Não disponível';
  const dataValida = new Date(data);
  if (Number.isNaN(dataValida.getTime())) return 'Não disponível';
  return dataValida.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Perfil({ usuario }) {
  const navigation = useNavigation();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    if (!auth) {
      Alert.alert('Não foi possível sair', 'A autenticação não está disponível agora.');
      return;
    }

    setSaindo(true);
    try {
      await signOut(auth);
      navigation.navigate('Inicio');
    } catch (_erro) {
      Alert.alert('Não foi possível sair', 'Tente novamente em instantes.');
    } finally {
      setSaindo(false);
    }
  }

  if (!usuario) {
    return (
      <SafeAreaView style={styles.tela}>
        <View style={styles.semLogin}>
          <Logo />
          <View style={styles.iconeSemLogin}><Text style={styles.iconeSemLoginTexto}>♙</Text></View>
          <Text style={styles.titulo}>Seu perfil</Text>
          <Text style={styles.descricao}>Entre na sua conta para ver suas informações e acompanhar sua experiência no FazAí.</Text>
          <Pressable
            style={({ pressed }) => [styles.botaoPrincipal, pressed && styles.botaoPressionado]}
            onPress={() => navigation.navigate('Entrar')}
            accessibilityRole="button"
          >
            <Text style={styles.botaoPrincipalTexto}>Entrar ou criar conta</Text>
          </Pressable>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  const nome = usuario.displayName?.trim() || 'Usuário FazAí';
  const inicial = (usuario.displayName || usuario.email || 'U').trim().charAt(0).toUpperCase();
  const telefone = usuario.phoneNumber;

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topo}>
          <Logo />
          <Text style={styles.sobretitulo}>SUA CONTA</Text>
        </View>

        <View style={styles.cabecalhoPerfil}>
          {usuario.photoURL ? (
            <Image source={{ uri: usuario.photoURL }} style={styles.avatarImagem} accessibilityLabel={`Foto de ${nome}`} />
          ) : (
            <View style={styles.avatar}><Text style={styles.avatarTexto}>{inicial}</Text></View>
          )}
          <View style={styles.identidade}>
            <Text style={styles.ola}>Olá,</Text>
            <Text style={styles.nome} numberOfLines={2}>{nome}</Text>
            <View style={styles.statusConta}>
              <View style={styles.pontoAtivo} />
              <Text style={styles.statusContaTexto}>Conta ativa</Text>
            </View>
          </View>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.tituloCartao}>Informações pessoais</Text>
          <Text style={styles.subtituloCartao}>Dados associados à sua conta FazAí.</Text>
          <View style={styles.listaInformacoes}>
            <LinhaInformacao rotulo="Nome" valor={usuario.displayName} />
            <LinhaInformacao rotulo="E-mail" valor={usuario.email} />
            {telefone ? <LinhaInformacao rotulo="Telefone" valor={telefone} /> : null}
            <LinhaInformacao rotulo="Membro desde" valor={formatarData(usuario.metadata?.creationTime)} ultima />
          </View>
        </View>

        <View style={styles.cartaoSeguranca}>
          <View style={styles.iconeSeguranca}><Text style={styles.iconeSegurancaTexto}>✓</Text></View>
          <View style={styles.textoSeguranca}>
            <Text style={styles.tituloSeguranca}>E-mail</Text>
            <Text style={styles.descricaoSeguranca}>
              {usuario.emailVerified ? 'Seu endereço de e-mail foi confirmado.' : 'Seu endereço de e-mail ainda não foi confirmado.'}
            </Text>
          </View>
          <Text style={[styles.etiquetaVerificacao, usuario.emailVerified ? styles.verificado : styles.pendente]}>
            {usuario.emailVerified ? 'Confirmado' : 'Pendente'}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.botaoSair, pressed && styles.botaoPressionado]}
          onPress={sair}
          disabled={saindo}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta FazAí"
        >
          <Text style={styles.botaoSairTexto}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text>
        </Pressable>
        <Text style={styles.nota}>Suas informações são usadas para identificar sua conta no FazAí.</Text>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  marca: { color: cores.verde, fontSize: 30, fontWeight: '800', letterSpacing: -1.3 },
  coral: { color: cores.coral },
  sobretitulo: { color: cores.apoio, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  cabecalhoPerfil: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingHorizontal: 2 },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginRight: 17, borderRadius: 38, backgroundColor: cores.lima },
  avatarTexto: { color: cores.verde, fontSize: 30, fontWeight: '800' },
  avatarImagem: { width: 76, height: 76, marginRight: 17, borderRadius: 38, backgroundColor: '#EAF0E5' },
  identidade: { flex: 1 },
  ola: { color: cores.apoio, fontSize: 14 },
  nome: { marginTop: 2, color: cores.texto, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  statusConta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: '#EEF7D7' },
  pontoAtivo: { width: 7, height: 7, marginRight: 6, borderRadius: 4, backgroundColor: '#4D8B54' },
  statusContaTexto: { color: cores.verde, fontSize: 11, fontWeight: '700' },
  cartao: { padding: 19, borderWidth: 1, borderColor: cores.borda, borderRadius: 18, backgroundColor: '#FFFFFF' },
  tituloCartao: { color: cores.texto, fontSize: 17, fontWeight: '800' },
  subtituloCartao: { marginTop: 5, color: cores.apoio, fontSize: 12, lineHeight: 18 },
  listaInformacoes: { marginTop: 11 },
  linhaInformacao: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F2ED' },
  ultimaLinha: { borderBottomWidth: 0 },
  rotuloInformacao: { color: cores.apoio, fontSize: 11, fontWeight: '600' },
  valorInformacao: { marginTop: 5, color: cores.texto, fontSize: 14, fontWeight: '700' },
  cartaoSeguranca: { flexDirection: 'row', alignItems: 'center', marginTop: 14, padding: 15, borderWidth: 1, borderColor: cores.borda, borderRadius: 16, backgroundColor: '#FFFFFF' },
  iconeSeguranca: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 11, borderRadius: 17, backgroundColor: '#EEF7D7' },
  iconeSegurancaTexto: { color: cores.verde, fontSize: 18, fontWeight: '800' },
  textoSeguranca: { flex: 1 },
  tituloSeguranca: { color: cores.texto, fontSize: 13, fontWeight: '800' },
  descricaoSeguranca: { marginTop: 3, color: cores.apoio, fontSize: 11, lineHeight: 16 },
  etiquetaVerificacao: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, fontSize: 10, fontWeight: '800', overflow: 'hidden' },
  verificado: { color: '#28623B', backgroundColor: '#E5F3E4' },
  pendente: { color: '#95611A', backgroundColor: '#FFF2D5' },
  botaoSair: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderWidth: 1, borderColor: '#F4C9BE', borderRadius: 13, backgroundColor: '#FFF7F4' },
  botaoSairTexto: { color: '#B94D35', fontSize: 14, fontWeight: '800' },
  botaoPressionado: { opacity: 0.75 },
  nota: { marginTop: 14, color: '#9AA49B', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  semLogin: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  iconeSemLogin: { width: 74, height: 74, alignItems: 'center', justifyContent: 'center', marginTop: 32, marginBottom: 10, borderRadius: 37, backgroundColor: '#EEF7D7' },
  iconeSemLoginTexto: { color: cores.verde, fontSize: 35 },
  titulo: { marginTop: 12, color: cores.texto, fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center' },
  descricao: { maxWidth: 350, marginTop: 9, color: cores.apoio, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  botaoPrincipal: { minHeight: 52, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', maxWidth: 360, marginTop: 22, paddingHorizontal: 18, borderRadius: 12, backgroundColor: cores.lima },
  botaoPrincipalTexto: { color: cores.texto, fontSize: 14, fontWeight: '800' },
});
