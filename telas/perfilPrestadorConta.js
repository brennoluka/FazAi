import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useApp } from '../context/AppContext';
import { carregarDadosContato } from '../dados/perfilUsuario';
import CabecalhoTela from '../componentes/CabecalhoTela';

function CampoResumo({ titulo, valor, styles }) {
  return (
    <View style={styles.campoResumo}>
      <Text style={styles.rotulo}>{titulo}</Text>
      <Text style={styles.valor}>{valor || 'Não informado'}</Text>
    </View>
  );
}

export default function PerfilPrestadorConta({ usuario }) {
  const navigation = useNavigation();
  const { colors, textScale, servicosPublicados, mostrarFeedback } = useApp();
  const styles = makeStyles(colors, textScale);
  const [perfil, setPerfil] = useState(null);
  const [contato, setContato] = useState(null);
  const [saindo, setSaindo] = useState(false);
  const meusAnuncios = servicosPublicados.filter((servico) => servico.prestadorUid === usuario?.uid);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const [perfilSalvo, contatoSalvo] = await Promise.all([
          AsyncStorage.getItem(`fazai:provider:${usuario?.uid}`),
          carregarDadosContato(usuario?.uid),
        ]);
        if (!ativo) return;
        setPerfil(perfilSalvo ? JSON.parse(perfilSalvo) : null);
        setContato(contatoSalvo);
      } catch (_erro) {
        if (ativo) {
          setPerfil(null);
          setContato(null);
        }
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [usuario?.uid]);

  function criarAnuncio() {
    navigation.navigate('Acao');
  }

  function abrirAnuncio(servico) {
    navigation.getParent()?.navigate('PerfilPrestador', { service: servico });
  }

  async function sair() {
    if (!auth) return;
    setSaindo(true);
    try {
      await signOut(auth);
      navigation.navigate('Inicio');
    } catch (_erro) {
      mostrarFeedback('Não foi possível sair', 'Tente novamente em instantes.', 'erro');
    } finally {
      setSaindo(false);
    }
  }

  const nome = usuario?.displayName?.trim() || 'Prestador FazAí';
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <CabecalhoTela rotulo="ÁREA DO PRESTADOR" />
        <View style={styles.cabecalhoPerfil}>
          {usuario?.photoURL
            ? <Image source={{ uri: usuario.photoURL }} style={styles.avatarImagem} accessibilityLabel={`Foto de ${nome}`} />
            : <View style={styles.avatar}><Text style={styles.avatarTexto}>{inicial}</Text></View>}
          <View style={styles.identidade}>
            <Text style={styles.ola}>Perfil profissional</Text>
            <Text style={styles.nome}>{nome}</Text>
            <Text style={styles.tag}>PRESTADOR DE SERVIÇOS</Text>
          </View>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.tituloCartao}>Sua atuação</Text>
          <Text style={styles.subtituloCartao}>Informações profissionais cadastradas no FazAí.</Text>
          <CampoResumo titulo="Especialidade" valor={perfil?.categoria} styles={styles} />
          <CampoResumo titulo="Cidade onde atende" valor={perfil?.cidade} styles={styles} />
          <CampoResumo titulo="Sobre seu trabalho" valor={perfil?.descricao} styles={styles} />
        </View>

        <View style={styles.cartao}>
          <Text style={styles.tituloCartao}>Dados da conta</Text>
          <CampoResumo titulo="E-mail" valor={usuario?.email} styles={styles} />
          <CampoResumo titulo="Número de contato" valor={contato?.celular} styles={styles} />
          <CampoResumo titulo="Endereço" valor={contato?.endereco} styles={styles} />
        </View>

        <View style={styles.secaoAnuncios}>
          <View style={styles.tituloLinha}>
            <View style={styles.tituloAnunciosGrupo}>
              <Text style={styles.tituloCartao}>Seus anúncios</Text>
              <Text style={styles.subtituloCartao}>{meusAnuncios.length} serviço(s) publicado(s)</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={criarAnuncio} style={styles.botaoNovo}>
              <Text style={styles.botaoNovoTexto}>+ Criar anúncio</Text>
            </Pressable>
          </View>

          {meusAnuncios.length === 0 ? (
            <View style={styles.vazio}>
              <Text style={styles.vazioTitulo}>Seu primeiro anúncio começa aqui</Text>
              <Text style={styles.vazioTexto}>Descreva o serviço, a categoria, o preço e a cidade para que clientes encontrem sua oferta.</Text>
              <Pressable accessibilityRole="button" onPress={criarAnuncio} style={styles.botaoPrincipal}>
                <Text style={styles.botaoPrincipalTexto}>Criar meu primeiro anúncio</Text>
              </Pressable>
            </View>
          ) : meusAnuncios.map((servico) => (
            <Pressable key={servico.id} accessibilityRole="button" onPress={() => abrirAnuncio(servico)} style={styles.anuncio}>
              <View style={styles.anuncioTopo}>
                <Text style={styles.categoria}>{servico.categoria}</Text>
                <Text style={styles.status}>Ativo</Text>
              </View>
              <Text style={styles.anuncioTitulo}>{servico.titulo}</Text>
              <Text style={styles.anuncioDescricao} numberOfLines={3}>{servico.descricao}</Text>
              <Text style={styles.anuncioRodape}>{servico.cidade} · {servico.preco}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.nota}>Os anúncios e dados de contato ficam salvos neste aparelho; ainda não são sincronizados com outros dispositivos.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta FazAí" onPress={sair} disabled={saindo} style={styles.botaoSair}>
          <Text style={styles.botaoSairTexto}>{saindo ? 'Saindo...' : 'Sair da conta'}</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style={colors.background === '#171717' ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  tela: { flex: 1, backgroundColor: c.background },
  conteudo: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 34 },
  cabecalhoPerfil: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 23 },
  avatar: { width: 74, height: 74, alignItems: 'center', justifyContent: 'center', marginRight: 16, borderRadius: 37, backgroundColor: c.lime },
  avatarTexto: { color: '#232323', fontSize: 29 * scale, fontWeight: '900' },
  avatarImagem: { width: 74, height: 74, marginRight: 16, borderRadius: 37 },
  identidade: { flex: 1 },
  ola: { color: c.muted, fontSize: 13 * scale },
  nome: { marginTop: 3, color: c.text, fontSize: 23 * scale, lineHeight: 29 * scale, fontWeight: '900' },
  tag: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, overflow: 'hidden', color: c.primary, backgroundColor: c.surfaceMuted, fontSize: 9 * scale, fontWeight: '900', letterSpacing: 0.5 },
  cartao: { marginBottom: 14, padding: 18, borderWidth: 1, borderColor: c.border, borderRadius: 18, backgroundColor: c.surface },
  tituloCartao: { color: c.text, fontSize: 17 * scale, fontWeight: '900' },
  subtituloCartao: { marginTop: 4, color: c.muted, fontSize: 12 * scale, lineHeight: 17 * scale },
  campoResumo: { paddingTop: 13, marginTop: 11, borderTopWidth: 1, borderTopColor: c.border },
  rotulo: { color: c.muted, fontSize: 11 * scale, fontWeight: '700' },
  valor: { marginTop: 4, color: c.text, fontSize: 13 * scale, lineHeight: 19 * scale, fontWeight: '700' },
  secaoAnuncios: { marginTop: 7 },
  tituloLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tituloAnunciosGrupo: { flex: 1, paddingRight: 8 },
  botaoNovo: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 12, backgroundColor: c.lime },
  botaoNovoTexto: { color: '#232323', fontSize: 11 * scale, fontWeight: '900' },
  vazio: { alignItems: 'flex-start', padding: 18, borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface },
  vazioTitulo: { color: c.text, fontSize: 15 * scale, fontWeight: '900' },
  vazioTexto: { marginTop: 6, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
  botaoPrincipal: { minHeight: 46, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch', marginTop: 16, paddingHorizontal: 14, borderRadius: 11, backgroundColor: c.lime },
  botaoPrincipalTexto: { color: '#232323', fontSize: 12 * scale, fontWeight: '900' },
  anuncio: { marginBottom: 10, padding: 16, borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface },
  anuncioTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  categoria: { color: c.primary, fontSize: 11 * scale, fontWeight: '900' },
  status: { color: c.primary, fontSize: 10 * scale, fontWeight: '800' },
  anuncioTitulo: { marginTop: 9, color: c.text, fontSize: 15 * scale, fontWeight: '900' },
  anuncioDescricao: { marginTop: 5, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
  anuncioRodape: { marginTop: 11, color: c.muted, fontSize: 11 * scale, fontWeight: '700' },
  nota: { marginTop: 9, color: c.muted, fontSize: 10 * scale, lineHeight: 15 * scale, textAlign: 'center' },
  botaoSair: { minHeight: 49, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderWidth: 1, borderColor: c.coral, borderRadius: 13, backgroundColor: c.surface },
  botaoSairTexto: { color: c.coral, fontSize: 13 * scale, fontWeight: '900' },
});
