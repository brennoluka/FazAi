# FazAí — entregas

As melhorias anteriores permanecem concluídas. Esta rodada acrescenta as seguintes entregas:

- [x] Integrar o endereço de contratação ao ViaCEP por CEP, preenchendo logradouro, bairro, cidade e UF e permitindo complemento/número.
- [x] Validar cada campo de endereço com mensagens específicas e impedir o envio quando faltarem dados obrigatórios.
- [x] Aplicar máscara DD/MM/AAAA à data, aceitar somente datas exatas e bloquear datas anteriores ao dia atual.
- [x] Adicionar mini calendário com navegação mensal e dias passados desabilitados.
- [x] Reforçar legibilidade do modo escuro em textos, superfícies, bordas, cards, inputs e ações.
- [x] Mostrar mensagens específicas quando senha, cidade, e-mail, CEP ou outros dados estiverem incorretos.
- [x] Trocar a aba Publicar do cliente por Pedir ajuda; clientes publicam problemas para prestadores.
- [x] Manter Publicar para prestadores, com autopublicação de serviço, categoria, preço, cidade e descrição.
- [x] Criar perfil público do prestador com média, volume de serviços e comentários.
- [x] Transformar a Busca em uma experiência mais limpa, com filtros por texto, nota mínima, preço máximo e cidade/região.
- [x] Nos cadastros de cliente e prestador, exigir endereço completo e número de celular; salvar ambos localmente associados ao UID da conta.
- [x] Após criar conta de cliente ou prestador, enviar link de confirmação ao e-mail; manter o acesso às telas autenticadas bloqueado até o Firebase informar que o e-mail foi verificado.
- [x] Na tela de confirmação, permitir reenviar o link e atualizar o status depois que a pessoa conclua a confirmação; o celular é coletado, mas não recebe código de validação por SMS.
- [x] Exibir endereço e celular salvos nas informações do perfil, quando disponíveis.
- [x] Nos cadastros de cliente e prestador, aceitar um CEP de 8 dígitos e consultar `https://viacep.com.br/ws/{CEP}/json/`; preencher logradouro, bairro, cidade e UF, deixar os campos revisáveis, exigir número, aceitar complemento opcional e mostrar mensagens para CEP inválido/não encontrado ou falha de conexão.
- [x] Exibir uma tela de perfil específica quando a conta autenticada for de prestador, com dados de atuação e acesso aos anúncios publicados.
- [x] Permitir ao prestador criar um anúncio com nome do serviço, categoria, preço ou forma de cobrança, descrição e cidade; associar a publicação à conta do prestador e apresentá-la imediatamente no início e na busca.
- [x] Exibir no perfil privado do prestador somente os anúncios associados ao UID daquela conta, com ação direta para criar outro anúncio.
- [x] Permitir que uma pessoa autenticada com conta de cliente use a própria conta para criar um perfil de prestador, sem tentar registrar o mesmo e-mail novamente.
- [x] Para quem não estiver autenticado, permitir entrar com uma conta existente no fluxo de prestador e salvar o perfil profissional nessa mesma conta.
- [x] Carregar o papel da conta antes de mostrar as telas autenticadas; uma leitura assíncrona antiga não pode substituir a decisão de prestador feita após o cadastro.

> Observação: o pagamento continua demonstrativo. O endereço do serviço e os endereços de cadastro consultam o ViaCEP. Endereço, celular e anúncios de prestadores ficam no armazenamento local do aparelho e não sincronizam entre dispositivos. A confirmação de contato implementada nesta rodada é apenas por e-mail; não há envio de SMS.
