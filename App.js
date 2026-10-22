import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Autenticacao from './telas/autenticacao';
import { auth } from './firebase';

const Stack = createNativeStackNavigator();
const abas = [
  ['Início', '⌂'],
  ['Buscar', '⌕'],
  ['Publicar', '+'],
  ['Atividade', '♡'],
  ['Perfil', '♙'],
];

function BarraInferior({ atual }) {
  const navigation = useNavigation();
  return (
    <View style={styles.barra}>
      {abas.map(([nome, icone]) => (
        <Pressable key={nome} style={styles.aba} onPress={() => navigation.navigate(nome)}>
          <Text style={[styles.icone, atual === nome && styles.abaAtiva]}>{icone}</Text>
          <Text style={[styles.nomeAba, atual === nome && styles.abaAtiva]}>{nome}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Perfil({ usuario }) {
  const navigation = useNavigation();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    try {
      await signOut(auth);
      navigation.navigate('Início');
    } finally {
      setSaindo(false);
    }
  }

  if (!usuario) {
    return (
      <>
        <Text style={styles.titulo}>Seu perfil</Text>
        <Text style={styles.texto}>Entre para acompanhar suas atividades e publicar no FazAí.</Text>
        <Pressable style={styles.botaoConta} onPress={() => navigation.navigate('Entrar')}>
          <Text style={styles.botaoContaTexto}>Entrar ou criar conta</Text>
        </Pressable>
      </>
    );
  }

  return (
    <View style={styles.perfilCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarTexto}>{(usuario.displayName || usuario.email || 'U').charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.titulo}>{usuario.displayName || 'Usuário FazAí'}</Text>
      <Text style={styles.email}>{usuario.email}</Text>
      <Text style={styles.status}>Conta conectada com Firebase</Text>
      <Pressable style={styles.botaoSair} onPress={sair} disabled={saindo}>
        <Text style={styles.botaoSairTexto}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text>
      </Pressable>
    </View>
  );
}

function Pagina({ nome, titulo, texto, usuario }) {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Text style={styles.marca}>faz<Text style={styles.coral}>aí.</Text></Text>
        {nome === 'Perfil' ? <Perfil usuario={usuario} /> : (
          <>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.texto}>{texto}</Text>
            <Pressable style={styles.botao} onPress={() => navigation.navigate('Detalhes')}>
              <Text style={styles.botaoTexto}>Abrir página</Text>
            </Pressable>
          </>
        )}
      </View>
      <BarraInferior atual={nome} />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Detalhes() {
  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Página interna</Text>
        <Text style={styles.texto}>Texto placeholder genérico para esta página.</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!auth) {
      setCarregando(false);
      return undefined;
    }
    return onAuthStateChanged(auth, (usuarioAtual) => {
      setUsuario(usuarioAtual);
      setCarregando(false);
    });
  }, []);

  if (carregando) {
    return <SafeAreaView style={styles.tela}><View style={styles.conteudo}><Text style={styles.texto}>Carregando sua conta...</Text></View></SafeAreaView>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Início">
          {() => <Pagina nome="Início" titulo="Bem-vindo ao FazAí" texto="Texto placeholder genérico para a página inicial." usuario={usuario} />}
        </Stack.Screen>
        <Stack.Screen name="Buscar">
          {() => <Pagina nome="Buscar" titulo="Buscar" texto="Texto placeholder genérico para busca." usuario={usuario} />}
        </Stack.Screen>
        <Stack.Screen name="Publicar">
          {() => <Pagina nome="Publicar" titulo="Publicar" texto="Texto placeholder genérico para publicação." usuario={usuario} />}
        </Stack.Screen>
        <Stack.Screen name="Atividade">
          {() => <Pagina nome="Atividade" titulo="Atividade" texto="Texto placeholder genérico para atividade." usuario={usuario} />}
        </Stack.Screen>
        <Stack.Screen name="Perfil">
          {() => <Pagina nome="Perfil" usuario={usuario} />}
        </Stack.Screen>
        <Stack.Screen name="Entrar">
          {() => <Autenticacao modo="login" />}
        </Stack.Screen>
        <Stack.Screen name="Cadastro">
          {() => <Autenticacao modo="cadastro" />}
        </Stack.Screen>
        <Stack.Screen name="Detalhes" component={Detalhes} options={{ headerShown: true, title: 'Voltar' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#FBFCF6' },
  conteudo: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  marca: { marginBottom: 34, color: '#1D4636', fontSize: 42, fontWeight: '800' },
  coral: { color: '#EF7655' },
  titulo: { color: '#203A30', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  texto: { maxWidth: 300, marginTop: 12, color: '#7D8980', fontSize: 16, lineHeight: 23, textAlign: 'center' },
  email: { marginTop: 6, color: '#7D8980', fontSize: 14 },
  status: { marginTop: 14, color: '#1D4636', fontSize: 12, fontWeight: '700' },
  botao: { marginTop: 26, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, backgroundColor: '#D5FA75' },
  botaoTexto: { color: '#203A30', fontSize: 15, fontWeight: '700' },
  botaoConta: { marginTop: 22, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#D5FA75', borderRadius: 12, backgroundColor: '#D5FA75' },
  botaoContaTexto: { color: '#1D4636', fontSize: 14, fontWeight: '700' },
  perfilCard: { width: '100%', maxWidth: 360, alignItems: 'center', padding: 26, borderRadius: 20, backgroundColor: '#FFFFFF' },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderRadius: 38, backgroundColor: '#D5FA75' },
  avatarTexto: { color: '#1D4636', fontSize: 30, fontWeight: '800' },
  botaoSair: { marginTop: 22, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, backgroundColor: '#FDE5DE' },
  botaoSairTexto: { color: '#B94D35', fontSize: 14, fontWeight: '800' },
  barra: { height: 78, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#E7E9E1', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  aba: { width: '20%', alignItems: 'center', justifyContent: 'center' },
  icone: { color: '#91A096', fontSize: 25, lineHeight: 28 },
  nomeAba: { marginTop: 3, color: '#91A096', fontSize: 10 },
  abaAtiva: { color: '#1D4636', fontWeight: '800' },
});
