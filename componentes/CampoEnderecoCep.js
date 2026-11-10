import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { consultarEnderecoPorCep, extrairDigitosCep, formatarCep } from '../dados/viacep';

const novoEndereco = () => ({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' });

function montarEndereco(form) {
  const cep = extrairDigitosCep(form.cep);
  const obrigatorios = [form.logradouro, form.numero, form.bairro, form.cidade, form.uf];
  if (cep.length !== 8 || obrigatorios.some((valor) => !valor.trim())) return '';

  const complemento = form.complemento.trim() ? `, ${form.complemento.trim()}` : '';
  return `${form.logradouro.trim()}, ${form.numero.trim()}${complemento}, ${form.bairro.trim()}, ${form.cidade.trim()}/${form.uf.trim().toUpperCase()} — CEP ${formatarCep(cep)}`;
}

function textoDoErro(erro) {
  if (erro?.message === 'CEP_INVALIDO') return 'Digite um CEP com exatamente 8 números.';
  if (erro?.message === 'CEP_NAO_ENCONTRADO') return 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.';
  return 'Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.';
}

export default function CampoEnderecoCep({ onChangeText }) {
  const { colors, textScale } = useApp();
  const styles = makeStyles(colors, textScale);
  const [form, setForm] = useState(novoEndereco);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const cepAtual = useRef('');
  const consultaAtual = useRef(0);
  const cepEmConsulta = useRef('');
  const ultimoCepConsultado = useRef('');

  function publicar(next) {
    onChangeText?.(montarEndereco(next));
  }

  function atualizar(campo, valor) {
    const next = { ...form, [campo]: valor };
    setForm(next);
    publicar(next);
    setMensagem('');
    setErro(false);
  }

  function alterarCep(valor) {
    const digitos = extrairDigitosCep(valor);
    if (digitos !== cepAtual.current) {
      consultaAtual.current += 1;
      cepEmConsulta.current = '';
      ultimoCepConsultado.current = '';
      cepAtual.current = digitos;
      const next = { ...novoEndereco(), cep: formatarCep(digitos) };
      setForm(next);
      publicar(next);
      setMensagem('');
      setErro(false);
      setBuscando(false);
      return;
    }
    const next = { ...form, cep: formatarCep(digitos) };
    setForm(next);
    publicar(next);
  }

  async function buscarCep(valorCep = form.cep) {
    const cep = extrairDigitosCep(valorCep);
    if (cep.length !== 8) {
      setErro(true);
      setMensagem('Digite um CEP com exatamente 8 números.');
      return;
    }
    if (cepEmConsulta.current === cep || ultimoCepConsultado.current === cep) return;

    const idConsulta = ++consultaAtual.current;
    cepEmConsulta.current = cep;
    setBuscando(true);
    setErro(false);
    setMensagem('Consultando endereço...');
    try {
      const dados = await consultarEnderecoPorCep(cep);
      if (consultaAtual.current !== idConsulta || cepAtual.current !== cep) return;
      const next = {
        ...form,
        cep: dados.cep,
        logradouro: dados.logradouro,
        bairro: dados.bairro,
        cidade: dados.cidade,
        uf: dados.uf,
      };
      setForm(next);
      cepAtual.current = cep;
      ultimoCepConsultado.current = cep;
      publicar(next);
      setErro(false);
      setMensagem('Endereço encontrado. Confira os campos e informe o número.');
    } catch (erroConsulta) {
      if (consultaAtual.current !== idConsulta) return;
      setErro(true);
      setMensagem(textoDoErro(erroConsulta));
    } finally {
      if (consultaAtual.current === idConsulta) {
        cepEmConsulta.current = '';
        setBuscando(false);
      }
    }
  }

  function campo(label, campoFormulario, placeholder, opcoes = {}) {
    return (
      <View style={[styles.grupo, opcoes.coluna && styles.coluna]}>
        <Text style={styles.rotulo}>{label}</Text>
        <TextInput
          accessibilityLabel={label}
          value={form[campoFormulario]}
          onChangeText={(valor) => {
            if (opcoes.cep) alterarCep(valor);
            else atualizar(campoFormulario, opcoes.uppercase ? valor.toUpperCase().slice(0, 2) : valor);
          }}
          onBlur={opcoes.cep ? () => buscarCep(form.cep) : undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={opcoes.keyboardType || 'default'}
          autoCapitalize={opcoes.uppercase ? 'characters' : 'words'}
          autoCorrect={false}
          maxLength={opcoes.maxLength}
          editable={!buscando}
          style={[styles.input, opcoes.erroCep && erro && styles.inputErro]}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Endereço completo</Text>
      <Text style={styles.ajuda}>Informe o CEP para preencher rua, bairro, cidade e UF. Você pode revisar os campos.</Text>
      {campo('CEP *', 'cep', '00000-000', { keyboardType: 'numeric', maxLength: 9, erroCep: true, cep: true })}
      <Pressable
        accessibilityRole="button"
        onPress={() => buscarCep(form.cep)}
        disabled={buscando}
        style={({ pressed }) => [styles.botaoCep, pressed && styles.botaoPressionado, buscando && styles.botaoDesativado]}
      >
        {buscando ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={styles.botaoCepTexto}>Consultar CEP</Text>}
      </Pressable>
      {mensagem ? <Text style={[styles.mensagem, erro ? styles.mensagemErro : styles.mensagemSucesso]} accessibilityLiveRegion="polite">{mensagem}</Text> : null}
      <View style={styles.linha}>
        {campo('Logradouro *', 'logradouro', 'Rua, avenida ou estrada', { coluna: true })}
      </View>
      <View style={styles.linha}>
        {campo('Número *', 'numero', 'Ex.: 120', { coluna: true })}
        {campo('Complemento', 'complemento', 'Apto, bloco...', { coluna: true })}
      </View>
      <View style={styles.linha}>
        {campo('Bairro *', 'bairro', 'Seu bairro', { coluna: true })}
      </View>
      <View style={styles.linha}>
        {campo('Cidade *', 'cidade', 'Sua cidade', { coluna: true })}
        {campo('UF *', 'uf', 'SP', { coluna: true, uppercase: true, maxLength: 2 })}
      </View>
    </View>
  );
}

const makeStyles = (c, scale) => StyleSheet.create({
  container: { marginTop: 14, marginBottom: 3 },
  titulo: { color: c.text, fontSize: 14 * scale, fontWeight: '900' },
  ajuda: { marginTop: 5, color: c.muted, fontSize: 12 * scale, lineHeight: 18 * scale },
  grupo: { flex: 1, marginTop: 14 },
  coluna: { minWidth: 0 },
  rotulo: { marginBottom: 7, color: c.text, fontSize: 11 * scale, fontWeight: '800' },
  input: { minHeight: 48, paddingHorizontal: 12, borderWidth: 1, borderColor: c.border, borderRadius: 11, color: c.text, backgroundColor: c.surface, fontSize: 13 * scale, outlineStyle: 'none' },
  inputErro: { borderColor: c.coral },
  linha: { flexDirection: 'row', gap: 10 },
  botaoCep: { minHeight: 42, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: c.surfaceMuted },
  botaoCepTexto: { color: c.primary, fontSize: 12 * scale, fontWeight: '900' },
  botaoPressionado: { opacity: 0.78 },
  botaoDesativado: { opacity: 0.6 },
  mensagem: { marginTop: 8, fontSize: 11 * scale, lineHeight: 16 * scale },
  mensagemErro: { color: c.coral },
  mensagemSucesso: { color: c.primary },
});
