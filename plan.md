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

## Estrutura

- `App.js`: navegação, feed, busca e publicação; controla o acesso autenticado e ainda não verificado.
- `context/AppContext.js`: tema, acessibilidade e pedidos locais demonstrativos.
- `componentes/Logo.js`: marca compartilhada.
- `telas/contratar.js`: seleção de dados, confirmação e pagamento demonstrativo.
- `telas/pedidos.js`: acompanhamento e avaliação.
- `telas/cadastroPrestador.js`: criação de conta de prestador e salvamento dos contatos.
- `telas/autenticacao.js`: acesso e cadastro de cliente com os dados de contato.
- `telas/verificacaoEmail.js`: envio/reenvio do link e rechecagem do status de confirmação.
- `telas/perfil.js`: conta, preferências e exibição dos dados salvos localmente.
- `assets/fazai-logo-mark.png`: símbolo da nova marca.
