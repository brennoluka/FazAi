import { StyleSheet, Text, View } from 'react-native';
import Logo from './Logo';
import { useApp } from '../context/AppContext';

export default function CabecalhoTela({ saudacao, rotulo }) {
  const { colors, textScale } = useApp();
  return <View style={styles.container}>
    <View style={styles.linha}><Logo /><Text style={[styles.rotulo, { color: colors.muted, fontSize: 10 * textScale }]}>{rotulo}</Text></View>
    {saudacao ? <Text style={[styles.saudacao, { color: colors.text, fontSize: 22 * textScale }]}>{saudacao}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  container: { paddingTop: 16, paddingBottom: 15 },
  linha: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rotulo: { fontWeight: '900', letterSpacing: 1.2 },
  saudacao: { marginTop: 14, fontWeight: '900' },
});
