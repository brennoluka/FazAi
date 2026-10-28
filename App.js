import { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  FlatList,
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
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Autenticacao from './telas/autenticacao';
import { auth } from './firebase';
import { ampliarServicos, servicos } from './dados/servicos';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
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

function pedirConta(navigation) {
  Alert.alert(
    'Crie uma conta para continuar',
    'Você precisa estar logado para pedir um serviço ou publicar uma necessidade.',
    [
      { text: 'Agora não', style: 'cancel' },
      { text: 'Criar conta', onPress: () => navigation.navigate('Cadastro') },
    ],
  );
}

function Cabecalho({ saudacao }) {
  return (
    <View style={styles.cabecalho}>
      <Logo />
      <Text style={styles.saudacao}>{saudacao}</Text>
    </View>
  );
}

function CardServico({ item, usuario }) {
  const navigation = useNavigation();
  return (
    <View style={styles.cardServico}>
      <View style={styles.cardTopo}>
        <View style={styles.categoriaPill}><Text style={styles.categoriaTexto}>{item.categoria}</Text></View>
        <Text style={styles.avaliacao}>★ {item.avaliacao}</Text>
      </View>
      <Text style={styles.cardTitulo}>{item.titulo}</Text>
      <Text style={styles.cardDescricao}>{item.descricao}</Text>
      <View style={styles.cardRodape}>
        <View>
          <Text style={styles.profissional}>{item.profissional}</Text>
          <Text style={styles.local}>{item.cidade}  ·  {item.preco}</Text>
        </View>
        <Pressable style={styles.botaoPedir} onPress={() => usuario ? Alert.alert('Pedido iniciado', `Vamos conectar você com ${item.profissional}.`) : pedirConta(navigation)}>
          <Text style={styles.botaoPedirTexto}>Pedir</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Inicio({ usuario }) {
  const [lista, setLista] = useState(servicos);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);

  function carregarMais() {
    if (carregando) return;
    setCarregando(true);
    setTimeout(() => {
      setLista((atual) => [...atual, ...ampliarServicos(pagina + 1)]);
      setPagina((atual) => atual + 1);
      setCarregando(false);
    }, 350);
  }

  return (
    <SafeAreaView style={styles.tela}>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardServico item={item} usuario={usuario} />}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.55}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaConteudo}
        ListHeaderComponent={<>
          <Cabecalho saudacao={usuario ? `Olá, ${usuario.displayName || 'você'}!` : 'Encontre ajuda perto de você'} />
          <View style={styles.hero}>
            <Text style={styles.heroEyebrow}>FEITO PARA O SEU DIA</Text>
            <Text style={styles.heroTitulo}>Resolva o que precisa. Do seu jeito.</Text>
            <Text style={styles.heroTexto}>Serviços de confiança para pequenas e grandes tarefas.</Text>
          </View>
          <Text style={styles.secaoTitulo}>Serviços em destaque</Text>
        </>}
        ListFooterComponent={carregando ? <Text style={styles.carregando}>Buscando mais serviços...</Text> : <Text style={styles.fimFeed}>Você chegou ao fim por enquanto.</Text>}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Buscar({ usuario }) {
  const [texto, setTexto] = useState('');
  const [lista, setLista] = useState(servicos);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const resultados = useMemo(() => {
    const busca = texto.trim().toLowerCase();
    if (!busca) return lista;
    return lista.filter((item) => [item.titulo, item.categoria, item.profissional, item.cidade].some((campo) => campo.toLowerCase().includes(busca)));
  }, [lista, texto]);

  function carregarMais() {
    if (carregando) return;
    setCarregando(true);
    setTimeout(() => {
      setLista((atual) => [...atual, ...ampliarServicos(pagina + 1)]);
      setPagina((atual) => atual + 1);
      setCarregando(false);
    }, 350);
  }

  return (
    <SafeAreaView style={styles.tela}>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CardServico item={item} usuario={usuario} />}
        onEndReached={carregarMais}
        onEndReachedThreshold={0.55}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaConteudo}
        ListHeaderComponent={<>
          <Cabecalho saudacao="O que você está procurando?" />
          <View style={styles.buscaLinha}>
            <Text style={styles.buscaIcone}>⌕</Text>
            <TextInput value={texto} onChangeText={setTexto} placeholder="Ex.: montagem, limpeza..." placeholderTextColor="#9AA49B" style={styles.buscaInput} returnKeyType="search" />
            {texto ? <Pressable onPress={() => setTexto('')}><Text style={styles.limpar}>Limpar</Text></Pressable> : null}
          </View>
          <Text style={styles.resultadoTitulo}>{texto ? `${resultados.length} resultado(s)` : 'Explore categorias e profissionais'}</Text>
        </>}
        ListEmptyComponent={<View style={styles.vazio}><Text style={styles.vazioTitulo}>Nada encontrado ainda</Text><Text style={styles.vazioTexto}>Tente buscar por outra palavra ou categoria.</Text></View>}
        ListFooterComponent={carregando ? <Text style={styles.carregando}>Buscando mais serviços...</Text> : null}
      />
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Publicar({ usuario }) {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [mensagem, setMensagem] = useState('');

  function publicar() {
    if (!usuario) {
      pedirConta(navigation);
      return;
    }
    if (!titulo.trim() || !descricao.trim()) {
      setMensagem('Preencha um título e conte um pouco do que você precisa.');
      return;
    }
    setMensagem('Pedido demonstrativo publicado! Em breve, profissionais poderão responder.');
    setTitulo('');
    setDescricao('');
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.publicarConteudo}>
          <Cabecalho saudacao="Peça uma ajuda" />
          <View style={styles.publicarIntro}>
            <Text style={styles.heroEyebrow}>PUBLIQUE UMA NECESSIDADE</Text>
            <Text style={styles.tituloPagina}>Descreva o que você precisa.</Text>
            <Text style={styles.textoPagina}>Conte os detalhes e encontre alguém pronto para ajudar.</Text>
          </View>
          <View style={styles.formulario}>
            <Text style={styles.rotulo}>O que você precisa?</Text>
            <TextInput value={titulo} onChangeText={(valor) => { setTitulo(valor); setMensagem(''); }} placeholder="Ex.: instalar uma prateleira" placeholderTextColor="#9AA49B" style={styles.input} />
            <Text style={styles.rotulo}>Conte mais detalhes</Text>
            <TextInput value={descricao} onChangeText={(valor) => { setDescricao(valor); setMensagem(''); }} placeholder="Explique o local, prazo e outras informações" placeholderTextColor="#9AA49B" style={[styles.input, styles.inputGrande]} multiline textAlignVertical="top" />
            {mensagem ? <Text style={styles.mensagem}>{mensagem}</Text> : null}
            <Pressable style={styles.botaoPrincipal} onPress={publicar}><Text style={styles.botaoPrincipalTexto}>{usuario ? 'Publicar pedido' : 'Criar conta para publicar'}  →</Text></Pressable>
          </View>
          <Text style={styles.nota}>Os serviços exibidos nesta versão são demonstrativos.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Atividade() {
  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.perfilConteudo} showsVerticalScrollIndicator={false}>
        <Logo />
        <Text style={styles.tituloPagina}>Sua atividade</Text>
        <Text style={styles.textoPagina}>Quando você pedir um serviço ou publicar uma necessidade, tudo aparecerá aqui.</Text>
        <View style={styles.atividadeCard}>
          <Text style={styles.atividadeIcone}>♡</Text>
          <Text style={styles.atividadeTitulo}>Nada por aqui ainda</Text>
          <Text style={styles.atividadeTexto}>Explore os serviços e comece quando quiser.</Text>
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function Perfil({ usuario }) {
  const navigation = useNavigation();
  const [saindo, setSaindo] = useState(false);
  async function sair() {
    setSaindo(true);
    try { await signOut(auth); navigation.navigate('Inicio'); } finally { setSaindo(false); }
  }
  if (!usuario) {
    return <SafeAreaView style={styles.tela}><View style={styles.perfilConteudo}><Logo /><Text style={styles.tituloPagina}>Seu perfil</Text><Text style={styles.textoPagina}>Entre para acompanhar suas atividades e publicar no FazAí.</Text><Pressable style={styles.botaoPrincipal} onPress={() => navigation.navigate('Entrar')}><Text style={styles.botaoPrincipalTexto}>Entrar ou criar conta</Text></Pressable></View><StatusBar style="dark" /></SafeAreaView>;
  }
  return <SafeAreaView style={styles.tela}><ScrollView contentContainerStyle={styles.perfilConteudo}><Logo /><View style={styles.perfilCard}><View style={styles.avatar}><Text style={styles.avatarTexto}>{(usuario.displayName || usuario.email || 'U').charAt(0).toUpperCase()}</Text></View><Text style={styles.tituloPagina}>{usuario.displayName || 'Usuário FazAí'}</Text><Text style={styles.email}>{usuario.email}</Text><Text style={styles.status}>Conta conectada com Firebase</Text><Pressable style={styles.botaoSair} onPress={sair} disabled={saindo}><Text style={styles.botaoSairTexto}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text></Pressable></View></ScrollView><StatusBar style="dark" /></SafeAreaView>;
}

function AbaIcone({ nome, ativo }) {
  const icones = { Inicio: '⌂', Buscar: '⌕', Publicar: '+', Atividade: '♡', Perfil: '♙' };
  return <Text style={[styles.abaIcone, ativo && styles.abaAtiva]}>{icones[nome]}</Text>;
}

function Abas({ usuario }) {
  return <Tabs.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: cores.verde, tabBarInactiveTintColor: '#91A096', tabBarStyle: styles.tabBar, tabBarLabelStyle: styles.tabLabel, tabBarHideOnKeyboard: true, tabBarIcon: ({ focused }) => <AbaIcone nome={route.name} ativo={focused} />, tabBarPressColor: '#EEF7D7' })}>
    <Tabs.Screen name="Inicio" options={{ title: 'Início' }}>{() => <Inicio usuario={usuario} />}</Tabs.Screen>
    <Tabs.Screen name="Buscar" options={{ title: 'Buscar' }}>{() => <Buscar usuario={usuario} />}</Tabs.Screen>
    <Tabs.Screen name="Publicar" options={{ title: 'Publicar' }}>{() => <Publicar usuario={usuario} />}</Tabs.Screen>
    <Tabs.Screen name="Atividade" options={{ title: 'Atividade' }}>{() => <Atividade />}</Tabs.Screen>
    <Tabs.Screen name="Perfil" options={{ title: 'Perfil' }}>{() => <Perfil usuario={usuario} />}</Tabs.Screen>
  </Tabs.Navigator>;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    if (!auth) { setCarregando(false); return undefined; }
    return onAuthStateChanged(auth, (usuarioAtual) => { setUsuario(usuarioAtual); setCarregando(false); });
  }, []);
  if (carregando) return <SafeAreaView style={styles.tela}><View style={styles.perfilConteudo}><Text style={styles.textoPagina}>Carregando sua conta...</Text></View></SafeAreaView>;
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Principal">{() => <Abas usuario={usuario} />}</Stack.Screen><Stack.Screen name="Entrar">{() => <Autenticacao modo="login" />}</Stack.Screen><Stack.Screen name="Cadastro">{() => <Autenticacao modo="cadastro" />}</Stack.Screen></Stack.Navigator></NavigationContainer>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tela: { flex: 1, backgroundColor: cores.fundo },
  listaConteudo: { paddingHorizontal: 18, paddingBottom: 24 },
  cabecalho: { paddingTop: 16, paddingBottom: 18 },
  marca: { color: cores.verde, fontSize: 32, fontWeight: '800', letterSpacing: -1.4 },
  coral: { color: cores.coral },
  saudacao: { marginTop: 16, color: cores.texto, fontSize: 22, fontWeight: '800' },
  hero: { padding: 22, marginBottom: 24, borderRadius: 22, backgroundColor: cores.verde },
  heroEyebrow: { color: '#A8C56B', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  heroTitulo: { maxWidth: 330, marginTop: 12, color: '#FFFFFF', fontSize: 26, lineHeight: 31, fontWeight: '800' },
  heroTexto: { maxWidth: 320, marginTop: 9, color: '#D5E4D5', fontSize: 14, lineHeight: 20 },
  secaoTitulo: { marginBottom: 12, color: cores.texto, fontSize: 18, fontWeight: '800' },
  cardServico: { marginBottom: 13, padding: 17, borderWidth: 1, borderColor: cores.borda, borderRadius: 17, backgroundColor: '#FFFFFF' },
  cardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoriaPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EEF7D7' },
  categoriaTexto: { color: cores.verde, fontSize: 11, fontWeight: '800' },
  avaliacao: { color: '#B7791F', fontSize: 12, fontWeight: '800' },
  cardTitulo: { marginTop: 12, color: cores.texto, fontSize: 18, fontWeight: '800' },
  cardDescricao: { marginTop: 6, color: cores.apoio, fontSize: 13, lineHeight: 19 },
  cardRodape: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 16 },
  profissional: { color: cores.texto, fontSize: 12, fontWeight: '700' },
  local: { marginTop: 4, color: '#9AA49B', fontSize: 11 },
  botaoPedir: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: cores.lima },
  botaoPedirTexto: { color: cores.texto, fontSize: 12, fontWeight: '800' },
  carregando: { paddingVertical: 18, color: cores.apoio, fontSize: 12, textAlign: 'center' },
  fimFeed: { paddingVertical: 18, color: '#A4ADA5', fontSize: 12, textAlign: 'center' },
  buscaLinha: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: cores.borda, borderRadius: 14, backgroundColor: '#FFFFFF' },
  buscaIcone: { marginRight: 10, color: cores.verde, fontSize: 25 },
  buscaInput: { flex: 1, minHeight: 48, color: cores.texto, fontSize: 14, outlineStyle: 'none' },
  limpar: { color: cores.verde, fontSize: 12, fontWeight: '800' },
  resultadoTitulo: { marginTop: 24, marginBottom: 12, color: cores.texto, fontSize: 16, fontWeight: '800' },
  vazio: { alignItems: 'center', padding: 32 },
  vazioTitulo: { color: cores.texto, fontSize: 17, fontWeight: '800' },
  vazioTexto: { marginTop: 8, color: cores.apoio, fontSize: 13, textAlign: 'center' },
  atividadeCard: { width: '100%', maxWidth: 360, alignItems: 'center', marginTop: 28, padding: 28, borderWidth: 1, borderColor: cores.borda, borderRadius: 18, backgroundColor: '#FFFFFF' },
  atividadeIcone: { color: cores.coral, fontSize: 36 },
  atividadeTitulo: { marginTop: 12, color: cores.texto, fontSize: 17, fontWeight: '800' },
  atividadeTexto: { maxWidth: 270, marginTop: 7, color: cores.apoio, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  publicarConteudo: { flexGrow: 1, padding: 18, paddingBottom: 30 },
  publicarIntro: { marginBottom: 22 },
  tituloPagina: { marginTop: 10, color: cores.texto, fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center' },
  textoPagina: { maxWidth: 360, marginTop: 9, color: cores.apoio, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  formulario: { padding: 20, borderWidth: 1, borderColor: cores.borda, borderRadius: 18, backgroundColor: '#FFFFFF' },
  rotulo: { marginBottom: 7, color: cores.texto, fontSize: 12, fontWeight: '800' },
  input: { minHeight: 50, marginBottom: 18, paddingHorizontal: 13, borderWidth: 1, borderColor: cores.borda, borderRadius: 11, color: cores.texto, fontSize: 14, outlineStyle: 'none' },
  inputGrande: { minHeight: 130, paddingTop: 13 },
  mensagem: { marginBottom: 14, color: cores.verde, fontSize: 13, lineHeight: 19 },
  botaoPrincipal: { minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 12, backgroundColor: cores.lima },
  botaoPrincipalTexto: { color: cores.texto, fontSize: 14, fontWeight: '800' },
  nota: { marginTop: 18, color: '#9AA49B', fontSize: 11, textAlign: 'center' },
  perfilConteudo: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  perfilCard: { width: '100%', maxWidth: 360, alignItems: 'center', marginTop: 20, padding: 26, borderRadius: 20, backgroundColor: '#FFFFFF' },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderRadius: 38, backgroundColor: cores.lima },
  avatarTexto: { color: cores.verde, fontSize: 30, fontWeight: '800' },
  email: { marginTop: 6, color: cores.apoio, fontSize: 14 },
  status: { marginTop: 14, color: cores.verde, fontSize: 12, fontWeight: '700' },
  botaoSair: { marginTop: 22, paddingVertical: 12, paddingHorizontal: 22, borderRadius: 12, backgroundColor: '#FDE5DE' },
  botaoSairTexto: { color: '#B94D35', fontSize: 14, fontWeight: '800' },
  tabBar: { height: Platform.OS === 'ios' ? 84 : 68, paddingTop: 5, paddingBottom: Platform.OS === 'ios' ? 20 : 7, borderTopWidth: 1, borderTopColor: '#E7E9E1', backgroundColor: '#FFFFFF' },
  tabLabel: { fontSize: 10, fontWeight: '700' },
  abaIcone: { color: '#91A096', fontSize: 23, lineHeight: 25 },
  abaAtiva: { color: cores.verde, fontWeight: '800' },
});
