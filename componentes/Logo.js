import { Image, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function Logo({ compact = false }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 7 : 9 }} accessibilityRole="image" accessibilityLabel="FazAí">
      <Image source={require('../assets/fazai-logo-mark.png')} style={{ width: compact ? 28 : 38, height: compact ? 28 : 38 }} resizeMode="contain" />
      <Text style={{ color: colors.text, fontSize: compact ? 25 : 30, fontWeight: '900', letterSpacing: -1.4 }}>faz<Text style={{ color: colors.coral }}>aí.</Text></Text>
    </View>
  );
}
