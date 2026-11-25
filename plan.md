# FazAí — plano de melhoria

## Escopo

Revisar a experiência do app Expo com foco em telas mais atrativas, acessibilidade, modo escuro, identidade visual renovada, contratação/pagamento/avaliação demonstrativos e cadastro específico de prestadores. Preservar Firebase Authentication e a navegação existente.

## Design

- **Movimento de design:** marketplace acolhedor com cartões editoriais, superfícies suaves e acentos lima/coral.
- **Princípios:** clareza antes de decoração; ações principais sempre visíveis; contraste e leitura confortáveis; confiança em cada etapa.
- **Filosofia de cor:** verde floresta comunica segurança; lima marca ação e disponibilidade; coral sinaliza cuidado, avaliação e estados de atenção; o modo escuro usa superfícies profundas sem perder esses acentos.
- **Layout:** feed vertical com blocos de destaque, cartões de serviço e jornadas em etapas; evitar telas congestionadas.
- **Elementos de assinatura:** marca com símbolo de mão/check; pills de estado; botões lima com cantos generosos.
- **Interação:** feedback de pressionado, mensagens claras, etapas curtas e confirmação antes de ações irreversíveis.
- **Acessibilidade:** labels nos controles, áreas de toque amplas, contraste alto, texto ajustável e preferência de tema persistida.
- **Tipografia:** sistema nativo, títulos fortes, corpo confortável e labels curtos.
- **Essência:** serviços locais confiáveis para resolver o dia; próximo, claro, seguro.
- **Logo:** símbolo abstrato de mão + check + faísca, acompanhado do wordmark FazAí.

## Implementação

1. Criar contexto de preferências para modo claro/escuro, contraste alto e tamanho de texto.
2. Consolidar logo e componentes visuais reutilizáveis.
3. Atualizar Início, Buscar, Publicar e Perfil com tema e acessibilidade.
4. Adicionar contratação de serviço em etapas, pagamento demonstrativo, pedidos e avaliação.
5. Adicionar cadastro de prestador com perfil de atuação.
6. Preservar Firebase Authentication e a navegação existente.
7. Nos cadastros de cliente e prestador, exigir endereço e celular e salvar esses dados localmente por UID.
8. Enviar confirmação de e-mail após cadastro e bloquear as telas autenticadas até a conta ser confirmada; permitir verificar novamente e reenviar a mensagem.
9. Validar bundle Web, dependências e navegação; sincronizar no GitHub quando solicitado.
10. Nos dois cadastros, consultar o CEP no ViaCEP, preencher logradouro, bairro, cidade e UF, permitir revisar os campos e exigir o número antes de salvar o endereço.
11. Selecionar a tela de perfil pelo tipo de conta; o prestador deve ver sua especialidade, região de atendimento, informações de contato e seus próprios anúncios.
12. Permitir ao prestador criar anúncio com serviço, categoria, preço, descrição e cidade; associar anúncio ao UID da conta, persistir localmente e colocá-lo no início e na busca imediatamente.
13. Manter os anúncios locais neste protótipo; não prometer sincronização entre aparelhos nem publicação em uma base compartilhada.

## Estrutura

- `App.js`: navegação, feed, busca e publicação; controla o acesso autenticado e ainda não verificado e seleciona o perfil da conta.
- `context/AppContext.js`: tema, acessibilidade, pedidos e anúncios locais demonstrativos.
- `componentes/Logo.js`: marca compartilhada.
- `componentes/CampoEnderecoCep.js`: campo de endereço reutilizável com consulta e preenchimento ViaCEP.
- `dados/perfilUsuario.js`: dados de contato do usuário, armazenados localmente por UID.
- `dados/servicos.js`: anúncios de exemplo e criação do feed.
- `dados/viacep.js`: validação de CEP e acesso JSON ao ViaCEP.
- `telas/contratar.js`: seleção de dados, confirmação e pagamento demonstrativo.
- `telas/pedidos.js`: acompanhamento e avaliação.
- `telas/cadastroPrestador.js`: criação de conta de prestador e salvamento dos contatos.
- `telas/acaoPrincipal.js`: formulário para cliente pedir ajuda ou prestador criar anúncio.
- `telas/autenticacao.js`: acesso e cadastro de cliente com os dados de contato.
- `telas/verificacaoEmail.js`: envio/reenvio do link e rechecagem do status de confirmação.
- `telas/perfil.js`: perfil do cliente, preferências e exibição dos dados salvos localmente.
- `telas/perfilPrestadorConta.js`: painel privado do prestador e seus anúncios.
- `telas/perfilPrestador.js`: perfil público do prestador aberto a partir de um anúncio.
- `assets/fazai-logo-mark.png`: símbolo da nova marca.


## Correção do fluxo de conta de prestador

- Permitir que uma pessoa já autenticada transforme a própria conta de cliente em conta de prestador, sem tentar criar outra conta com o mesmo e-mail.
- Para quem estiver desconectado, permitir entrar com e-mail/senha já cadastrados e então completar os dados profissionais na mesma conta.
- Carregar o tipo de conta antes de liberar a navegação e impedir que uma resposta assíncrona antiga do listener de autenticação sobrescreva o tipo atualizado durante o cadastro.
