export function extrairDigitosCep(valor) {
  return String(valor || '').replace(/\D/g, '').slice(0, 8);
}

export function formatarCep(valor) {
  const digitos = extrairDigitosCep(valor);
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
}

export async function consultarEnderecoPorCep(valor) {
  const cep = extrairDigitosCep(valor);
  if (!/^\d{8}$/.test(cep)) {
    throw new Error('CEP_INVALIDO');
  }

  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (resposta.status === 400) {
    throw new Error('CEP_INVALIDO');
  }
  if (!resposta.ok) {
    throw new Error('CEP_INDISPONIVEL');
  }

  const dados = await resposta.json();
  if (dados.erro) {
    throw new Error('CEP_NAO_ENCONTRADO');
  }

  return {
    cep: formatarCep(dados.cep || cep),
    logradouro: dados.logradouro || '',
    bairro: dados.bairro || '',
    cidade: dados.localidade || '',
    uf: dados.uf || '',
  };
}
