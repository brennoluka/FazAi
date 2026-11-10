import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { carregarDadosContato } from '../dados/perfilUsuario';
import Logo from '../componentes/Logo';
import { useApp } from '../context/AppContext';

function formatarData(data) {
  if (!data) return 'Não disponível';
  const value = new Date(data);
  return Number.isNaN(value.getTime()) ? 'Não disponível' : value.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Linha({ rotulo, valor, styles }) {
  return <View style={styles.linha}><Text style={styles.rotuloLinha}>{rotulo}</Text><Text style={styles.valorLinha} selectable>{valor || 'Não informado'}</Text></View>;
}

function Preferencia({ titulo, descricao, valor, onChange, styles }) {
  return <View style={styles.preferencia}><View style={styles.preferenciaTexto}><Text style={styles.preferenciaTitulo}>{titulo}</Text><Text style={styles.preferenciaDescricao}>{descricao}</Text></View><Switch accessibilityLabel={titulo} value={valor} onValueChange={onChange} trackColor={{ false: '#AAB8AE', true: '#9CCB57' }} thumbColor={valor ? '#FFFFFF' : '#F4F6F1'} /></View>;
}

export default function Perfil({ usuario }) {
  const navigation = useNavigation();
  const { colors, darkMode, altoContraste, textScale, alternarDarkMode, alternarContraste, alterarEscala } = useApp();
  const styles = makeStyles(colors, textScale);
  const [saindo, setSaindo] = useState(false);
  const [dadosContato, setDadosContato] = useState(null);

  useEffect(() => {
    let ativo = true;
    carregarDadosContato(usuario?.uid).then((dados) => {
      if (ativo) setDadosContato(dados);
    });
    return () => { ativo = false; };
  }, [usuario?.uid]);

  async function sair() {
    if (!auth) return;
    setSaindo(true);
    try {
      await signOut(auth);
      navigation.getParent()?.navigate('Inicio');
    } catch (_error) {
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
          <Text style={styles.titulo}>Seu perfil</Text>
          <Text style={styles.descricao}>Entre na sua conta para ver suas informações e acompanhar sua experiência no FazAí.</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.getParent()?.navigate('Entrar')} style={styles.botao}><Text style={styles.botaoTexto}>Entrar ou criar conta</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => navigation.getParent()?.navigate('CadastroPrestador')} style={styles.linkBotao}><Text style={styles.linkTexto}>Sou prestador de serviços</Text></Pressable>
        </View>
        <StatusBar style={darkMode ? 'light' : 'dark'} />
      </SafeAreaView>
    );
  }

  const nome = usuario.displayName?.trim() || 'Usuário FazAí';
  const inicial = (usuario.displayName || usuario.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}><Logo compact /><Text style={styles.sobretitulo}>SUA CONTA</Text></View>
        <View style={styles.cabecalhoPerfil}>
          {usuario.photoURL ? <Image source={{ uri: usuario.photoURL }} style={styles.avatarImagem} accessibilityLabel={`Foto de ${nome}`} /> : <View style={styles.avatar}><Text style={styles.avatarTexto}>{inicial}</Text></View>}
          <View style={styles.identidade}><Text style={styles.ola}>Olá,</Text><Text style={styles.nome}>{nome}</Text><View style={styles.statusConta}><View style={styles.pontoAtivo} /><Text style={styles.statusTexto}>Conta ativa</Text></View></View>
        </View>
        <View style={styles.cartao}>
          <Text style={styles.tituloCartao}>Informações pessoais</Text>
          <Text style={styles.subtituloCartao}>Dados associados à sua conta FazAí.</Text>
          <View style={styles.lista}>
            <Linha rotulo="Nome" valor={usuario.displayName} styles={styles} />
            <Linha rotulo="Email" valor={usuario.email} styles={styles} />
            {dadosContato?.celular ? <Linha rotulo="Numero de contato" valor={dadosContato.celular} styles={styles} /> : null}
            {dadosContato?.endereco ? <Linha rotulo="Endereço" valor={dadosContato.endereco} styles={styles} /> : null}
            <Linha rotulo="Membro desde" valor={formatarData(usuario.metadata?.creationTime)} styles={styles} />
          </View>
        </View>
        <View style={styles.cartao}>
          <Text style={styles.tituloCartao}>Acessibilidade</Text>
          <Preferencia titulo="Modo escuro" descricao="Reduz o brilho e melhora o conforto à noite." valor={darkMode} onChange={alternarDarkMode} styles={styles} />
          <Preferencia titulo="Alto contraste" descricao="Reforça a diferença entre texto, fundo e controles." valor={altoContraste} onChange={alternarContraste} styles={styles} />
          <View style={styles.preferencia}>
            <View style={styles.preferenciaTexto}><Text style={styles.preferenciaTitulo}>Tamanho do texto</Text><Text style={styles.preferenciaDescricao}>Ajuste a leitura do conteúdo.</Text></View>
            <View style={styles.tamanhoAcoes}>
              <Pressable accessibilityRole="button" accessibilityLabel="Diminuir tamanho do texto" onPress={() => alterarEscala(textScale - 0.05)} style={styles.tamanhoBotao}><Text style={styles.tamanhoBotaoTexto}>A−</Text></Pressable>
              <Text style={styles.tamanhoValor}>{Math.round(textScale * 100)}%</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Aumentar tamanho do texto" onPress={() => alterarEscala(textScale + 0.05)} style={styles.tamanhoBotao}><Text style={styles.tamanhoBotaoTexto}>A+</Text></Pressable>
            </View>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={() => navigation.getParent()?.navigate('CadastroPrestador')} style={styles.prestador}>
          <Text style={styles.prestadorTitulo}>Quer oferecer seus serviços?</Text>
          <Text style={styles.prestadorTexto}>Crie um perfil de prestador e comece a receber pedidos.</Text>
          <Text style={styles.prestadorLink}>Criar perfil de prestador →</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta FazAí" onPress={sair} disabled={saindo} style={styles.botaoSair}><Text style={styles.botaoSairTexto}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text></Pressable>
        <Text style={styles.nota}>Endereço e celular são salvos neste aparelho e não sincronizam entre dispositivos.</Text>
      </ScrollView>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  tela: { flex: 1, backgroundColor: c.background },
  conteudo: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  sobretitulo: { color: c.muted, fontSize: 10 * scale, fontWeight: '900', letterSpacing: 1.2 },
  cabecalhoPerfil: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', marginRight: 17, borderRadius: 38, backgroundColor: c.lime },
  avatarTexto: { color: '#203A30', fontSize: 30 * scale, fontWeight: '900' },
  avatarImagem: { width: 76, height: 76, marginRight: 17, borderRadius: 38 },
  identidade: { flex: 1 },
  ola: { color: c.muted, fontSize: 14 * scale },
  nome: { marginTop: 2, color: c.text, fontSize: 25 * scale, lineHeight: 31 * scale, fontWeight: '900' },
  statusConta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: c.surfaceMuted },
  pontoAtivo: { width: 7, height: 7, marginRight: 6, borderRadius: 4, backgroundColor: '#6EBB68' },
  statusTexto: { color: c.primary, fontSize: 11 * scale, fontWeight: '800' },
  cartao: { marginBottom: 14, padding: 19, borderWidth: 1, borderColor: c.border, borderRadius: 18, backgroundColor: c.surface },
  tituloCartao: { color: c.text, fontSize: 17 * scale, fontWeight: '900' },
  subtituloCartao: { marginTop: 5, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
  lista: { marginTop: 11 },
  linha: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: c.border },
  rotuloLinha: { color: c.muted, fontSize: 11 * scale, fontWeight: '700' },
  valorLinha: { marginTop: 5, color: c.text, fontSize: 14 * scale, lineHeight: 20 * scale, fontWeight: '800' },
  preferencia: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: c.border },
  preferenciaTexto: { flex: 1, paddingRight: 12 },
  preferenciaTitulo: { color: c.text, fontSize: 13 * scale, fontWeight: '900' },
  preferenciaDescricao: { marginTop: 3, color: c.muted, fontSize: 11 * scale, lineHeight: 16 * scale },
  tamanhoAcoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tamanhoBotao: { minWidth: 38, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: c.surfaceMuted },
  tamanhoBotaoTexto: { color: c.primary, fontWeight: '900' },
  tamanhoValor: { color: c.text, fontSize: 12 * scale, fontWeight: '800' },
  prestador: { marginTop: 4, padding: 18, borderRadius: 18, backgroundColor: c.primary },
  prestadorTitulo: { color: c.primaryText, fontSize: 16 * scale, fontWeight: '900' },
  prestadorTexto: { marginTop: 6, color: c.primaryText, opacity: 0.84, fontSize: 12 * scale, lineHeight: 18 * scale },
  prestadorLink: { marginTop: 13, color: c.lime, fontSize: 13 * scale, fontWeight: '900' },
  botaoSair: { minHeight: 50, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderWidth: 1, borderColor: c.coral, borderRadius: 13, backgroundColor: c.surface },
  botaoSairTexto: { color: c.coral, fontSize: 14 * scale, fontWeight: '900' },
  nota: { marginTop: 14, color: c.muted, fontSize: 11 * scale, lineHeight: 16 * scale, textAlign: 'center' },
  semLogin: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 26 },
  titulo: { marginTop: 24, color: c.text, fontSize: 27 * scale, fontWeight: '900', textAlign: 'center' },
  descricao: { maxWidth: 350, marginTop: 9, color: c.muted, fontSize: 14 * scale, lineHeight: 21 * scale, textAlign: 'center' },
  botao: { minHeight: 52, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', maxWidth: 360, marginTop: 22, borderRadius: 12, backgroundColor: c.lime },
  botaoTexto: { color: '#203A30', fontSize: 14 * scale, fontWeight: '900' },
  linkBotao: { padding: 16 },
  linkTexto: { color: c.primary, fontSize: 13 * scale, fontWeight: '900' },
});
