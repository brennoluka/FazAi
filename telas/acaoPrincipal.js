import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import CabecalhoTela from '../componentes/CabecalhoTela';

function Campo({ label, placeholder, value, onChangeText, styles, multiline = false, keyboardType }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={styles.placeholder.color}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.inputGrande]}
      />
    </View>
  );
}

function extrairPrecoMinimo(valor) {
  const normalizado = valor.replace(/[^\d,]/g, '').replace(',', '.');
  const preco = Number(normalizado);
  return Number.isFinite(preco) && preco > 0 ? preco : undefined;
}

export default function AcaoPrincipal({ isPrestador, usuario }) {
  const { colors, textScale, criarNecessidade, publicarServico, necessidades, mostrarFeedback } = useApp();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [preco, setPreco] = useState('');
  const [cidade, setCidade] = useState('');
  const [publicando, setPublicando] = useState(false);
  const styles = makeStyles(colors, textScale);

  async function enviar() {
    if (publicando) return;
    if (!usuario?.uid) {
      mostrarFeedback('Entre na sua conta', 'Faça login para publicar um serviço.', 'erro');
      return;
    }
    if (!titulo.trim() || !descricao.trim() || !cidade.trim() || (isPrestador && !categoria.trim())) {
      mostrarFeedback(
        'Confira os dados',
        isPrestador
          ? 'Preencha nome do serviço, categoria, descrição e cidade para criar o anúncio.'
          : 'Informe um título, os detalhes e a cidade do problema.',
        'erro',
      );
      return;
    }

    if (isPrestador) setPublicando(true);
    try {
      if (isPrestador) {
        const precoMin = extrairPrecoMinimo(preco);
        await publicarServico({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          categoria: categoria.trim(),
          preco: preco.trim() || 'A combinar',
          ...(precoMin ? { precoMin } : {}),
          cidade: cidade.trim(),
          profissional: usuario.displayName?.trim() || 'Prestador FazAí',
          prestadorUid: usuario.uid,
          avaliacao: 'Novo',
          avaliacaoNumerica: 0,
          servicosRealizados: 0,
          comentarios: [],
        });
        mostrarFeedback('Anúncio publicado', 'Seu serviço já aparece no Início e na busca deste aparelho.', 'sucesso');
      } else {
        criarNecessidade({
          titulo: titulo.trim(),
          descricao: descricao.trim(),
          cidade: cidade.trim(),
          autor: usuario.displayName || 'Cliente',
          autorUid: usuario.uid,
        });
        mostrarFeedback('Pedido publicado', 'Seu pedido de ajuda já está disponível para os prestadores.', 'sucesso');
      }
      setTitulo('');
      setDescricao('');
      setCategoria('');
      setPreco('');
      setCidade('');
    } catch (_erro) {
      mostrarFeedback('Não foi possível publicar', 'O anúncio não foi salvo. Verifique o armazenamento do aparelho e tente novamente.', 'erro');
    } finally {
      if (isPrestador) setPublicando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <CabecalhoTela rotulo={isPrestador ? 'ANÚNCIO DE SERVIÇO' : 'PEDIR AJUDA'} />
          <Text style={styles.titulo}>{isPrestador ? 'Apresente seu serviço.' : 'Conte o que você precisa.'}</Text>
          <Text style={styles.descricao}>
            {isPrestador
              ? 'Preencha os detalhes para criar seu anúncio. Depois de publicar, ele aparece no Início e na busca deste aparelho.'
              : 'Seu pedido ficará disponível para prestadores da sua região.'}
          </Text>

          {isPrestador ? (
            <>
              <Campo label="Nome do serviço" placeholder="Ex.: Instalação de ventilador" value={titulo} onChangeText={setTitulo} styles={styles} />
              <Campo label="Categoria" placeholder="Ex.: Elétrica" value={categoria} onChangeText={setCategoria} styles={styles} />
              <Campo label="Preço ou forma de cobrança" placeholder="Ex.: A partir de R$ 80 ou A combinar" value={preco} onChangeText={setPreco} styles={styles} />
            </>
          ) : (
            <Campo label="Título do problema" placeholder="Ex.: Preciso montar um armário" value={titulo} onChangeText={setTitulo} styles={styles} />
          )}

          <Campo
            label={isPrestador ? 'Descrição do serviço' : 'Detalhes do que você precisa'}
            placeholder={isPrestador ? 'Explique o que está incluso, sua experiência e diferenciais' : 'Informe prazo, medidas e outras informações'}
            value={descricao}
            onChangeText={setDescricao}
            styles={styles}
            multiline
          />
          <Campo label="Cidade ou região" placeholder="Ex.: São Paulo, SP" value={cidade} onChangeText={setCidade} styles={styles} />
          <Pressable accessibilityRole="button" onPress={enviar} disabled={publicando} style={[styles.botao, publicando && styles.botaoDesativado]}>
            <Text style={styles.botaoTexto}>{publicando ? 'Publicando...' : isPrestador ? 'Publicar meu anúncio  →' : 'Publicar pedido de ajuda  →'}</Text>
          </Pressable>

          {isPrestador && necessidades.length > 0 ? (
            <View style={styles.oportunidades}>
              <Text style={styles.oportunidadesTitulo}>Pedidos recentes na comunidade</Text>
              {necessidades.slice(0, 3).map((item) => (
                <View key={item.id} style={styles.oportunidade}>
                  <Text style={styles.oportunidadeTitulo}>{item.titulo}</Text>
                  <Text style={styles.oportunidadeTexto}>{item.cidade} · {item.descricao}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  flex: { flex: 1 },
  tela: { flex: 1, backgroundColor: c.background },
  conteudo: { flexGrow: 1, padding: 22, paddingBottom: 35 },
  titulo: { marginTop: 9, color: c.text, fontSize: 29 * scale, lineHeight: 35 * scale, fontWeight: '900' },
  descricao: { marginTop: 8, color: c.muted, fontSize: 14 * scale, lineHeight: 21 * scale },
  grupo: { marginTop: 20 },
  rotulo: { marginBottom: 7, color: c.text, fontSize: 12 * scale, fontWeight: '900' },
  input: { minHeight: 51, paddingHorizontal: 14, borderWidth: 1, borderColor: c.border, borderRadius: 13, color: c.text, backgroundColor: c.input, fontSize: 14 * scale },
  inputGrande: { minHeight: 125, paddingTop: 13 },
  placeholder: { color: c.muted },
  botao: { minHeight: 54, alignItems: 'center', justifyContent: 'center', marginTop: 23, borderRadius: 14, backgroundColor: c.lime },
  botaoDesativado: { opacity: 0.6 },
  botaoTexto: { color: '#232323', fontSize: 14 * scale, fontWeight: '900' },
  oportunidades: { marginTop: 32 },
  oportunidadesTitulo: { color: c.text, fontSize: 17 * scale, fontWeight: '900' },
  oportunidade: { marginTop: 10, padding: 14, borderWidth: 1, borderColor: c.border, borderRadius: 14, backgroundColor: c.surface },
  oportunidadeTitulo: { color: c.text, fontSize: 14 * scale, fontWeight: '900' },
  oportunidadeTexto: { marginTop: 5, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
});
