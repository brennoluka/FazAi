import { StyleSheet, Text, View } from 'react-native';

const servicos = [
  { nome: 'Limpeza', descricao: 'Ajuda com a limpeza da casa' },
  { nome: 'Elétrica', descricao: 'Pequenos reparos elétricos' },
  { nome: 'Hidráulica', descricao: 'Torneiras, canos e vazamentos' },
  { nome: 'Montagem', descricao: 'Montagem de móveis e objetos' },
];

export default function Detalhes() {
  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.titulo}>Serviços para você</Text>
        <Text style={styles.subtitulo}>Escolha uma categoria para começar.</Text>
      </View>
      <View style={styles.lista}>
        {servicos.map((servico) => (
          <View key={servico.nome} style={styles.card}>
            <View style={styles.marcador} />
            <View style={styles.cardTexto}>
              <Text style={styles.item}>{servico.nome}</Text>
              <Text style={styles.descricao}>{servico.descricao}</Text>
            </View>
            <Text style={styles.seta}>›</Text>
          </View>
        ))}
      </View>
      <Text style={styles.aviso}>Por enquanto, estas categorias são demonstrativas.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 22, backgroundColor: '#FFF7ED' },
  intro: { marginTop: 12, marginBottom: 22 },
  titulo: { color: '#3A2418', fontSize: 26, fontWeight: '800' },
  subtitulo: { marginTop: 7, color: '#7C6658', fontSize: 15, lineHeight: 22 },
  lista: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FFEDD5' },
  marcador: { width: 10, height: 42, marginRight: 14, borderRadius: 5, backgroundColor: '#FFD2A6' },
  cardTexto: { flex: 1 },
  item: { color: '#3A2418', fontSize: 16, fontWeight: '700' },
  descricao: { marginTop: 4, color: '#7C6658', fontSize: 13, lineHeight: 18 },
  seta: { marginLeft: 10, color: '#C85A16', fontSize: 28 },
  aviso: { maxWidth: 560, alignSelf: 'center', marginTop: 22, color: '#A88C78', fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
