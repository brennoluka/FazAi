import { Image, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';

export default function Logo({ compact = false }) {
  const { colors } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 7 : 9 }} accessibilityRole="image" accessibilityLabel="FazAí">
      <Image source={require('../assets/fazai-logo-mark.png')} style={{ width: compact ? 34 : 42, height: compact ? 34 : 42, tintColor: colors.primary }} resizeMode="contain" />
      <Text style={{ color: colors.primary, fontSize: compact ? 28 : 33, fontWeight: '900', letterSpacing: -1.4 }}>faz<Text style={{ color: colors.coral }}>aí.</Text></Text>
    </View>
  );
}
