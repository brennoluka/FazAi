import AsyncStorage from '@react-native-async-storage/async-storage';

function chavePerfil(uid) {
  return `fazai:profile:${uid}`;
}

export async function salvarDadosContato(uid, dados) {
  if (!uid) throw new Error('É necessário um UID para salvar os dados do perfil.');
  await AsyncStorage.setItem(chavePerfil(uid), JSON.stringify({
    endereco: dados.endereco.trim(),
    celular: dados.celular.trim(),
  }));
}

export async function carregarDadosContato(uid) {
  if (!uid) return null;
  try {
    const dadosSalvos = await AsyncStorage.getItem(chavePerfil(uid));
    return dadosSalvos ? JSON.parse(dadosSalvos) : null;
  } catch (_erro) {
    return null;
  }
}
