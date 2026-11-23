# Configuração do Firebase no FazAí

Este guia configura o Firebase Authentication usado pelo FazAí, incluindo o recurso **Esqueci minha senha**. O aplicativo usa `sendPasswordResetEmail` do Firebase para enviar um link de redefinição ao e-mail cadastrado.

## 1. Criar ou selecionar o projeto Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Crie um projeto novo ou selecione o projeto já usado pelo FazAí.
3. No menu do projeto, abra **Configurações do projeto**.
4. Na seção **Seus apps**, clique em **Adicionar app** e escolha o ícone da Web (`</>`).
5. Dê um apelido ao app, por exemplo `FazAí Web`.
6. O Firebase exibirá um objeto `firebaseConfig`. Mantenha essa página aberta; os valores serão usados no próximo passo.

Não é necessário instalar outro pacote: o projeto já possui a dependência `firebase`.

## 2. Ativar login por e-mail e senha

No Firebase Console:

1. Abra **Authentication**.
2. Clique em **Começar**, caso seja a primeira utilização.
3. Na aba **Sign-in method**, selecione **E-mail/senha**.
4. Ative a opção **E-mail/senha** e salve.
5. Não é necessário ativar a opção de link sem senha para este fluxo.

Sem o provedor **E-mail/senha** ativo, o cadastro, o login e a redefinição de senha não funcionarão.

## 3. Configurar os domínios autorizados

Ainda em **Authentication**, abra a aba **Settings** e confira **Authorized domains**. Para desenvolvimento web, inclua os domínios usados pelo projeto, normalmente:

- `localhost`;
- o domínio local exibido pelo Expo, se diferente;
- o domínio de produção, quando o app for publicado.

Não adicione domínios desconhecidos. Em produção, inclua somente os endereços realmente utilizados pelo aplicativo.

## 4. Criar o arquivo `.env.local`

Na raiz do projeto, copie o arquivo de exemplo:

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS/Linux

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha os valores do objeto `firebaseConfig` exibido nas configurações do app Web:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=cole_aqui_o_apiKey
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messagingSenderId
EXPO_PUBLIC_FIREBASE_APP_ID=seu_appId
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu_measurementId
```

Use os nomes exatamente como estão acima. As variáveis `EXPO_PUBLIC_` são lidas automaticamente pelo Expo e pelo arquivo `firebase.js`.

O arquivo `.env.local` já está protegido pelo `.gitignore`. **Não faça commit desse arquivo**. O `firebaseConfig` Web contém identificadores públicos do app, mas as credenciais privadas, chaves de serviço e arquivos de conta de serviço nunca devem ser colocados no aplicativo ou no repositório.

## 5. Instalar dependências e iniciar o app

Na pasta do projeto:

```bash
npm ci
npx expo start --web
```

Se o Expo já estava aberto antes da criação ou alteração do `.env.local`, encerre o processo e inicie-o novamente. O Metro precisa recarregar as variáveis de ambiente.

Para executar em um dispositivo, use o comando Expo correspondente ao ambiente instalado:

```bash
npx expo start
```

## 6. Como testar a redefinição de senha

1. Abra a tela de login do FazAí.
2. Toque em **Esqueci minha senha**.
3. Informe um e-mail existente no Firebase Authentication.
4. Toque em **Enviar link**.
5. Confirme que o app mostra o modal de envio concluído.
6. Abra o e-mail recebido e clique no link.
7. Defina uma nova senha na página do Firebase.
8. Volte ao FazAí e entre com o mesmo e-mail e a nova senha.

O e-mail pode demorar alguns instantes. Verifique também as pastas de spam, promoções ou lixo eletrônico.

## 7. Personalizar o e-mail de redefinição

No Firebase Console, abra **Authentication > Templates > Password reset**. Ali é possível alterar:

- nome do remetente;
- endereço de resposta;
- assunto;
- idioma e texto do e-mail;
- domínio e endereço usados na ação de redefinição.

Mantenha o link de ação gerado pelo Firebase no template. Removê-lo impede que o usuário conclua a troca de senha.

## 8. Solução de problemas

### “Firebase não configurado”

Confira se `.env.local` está na raiz do projeto, se os nomes das variáveis estão corretos e se o Expo foi reiniciado após a alteração. Não use aspas desnecessárias nem espaços antes ou depois do `=`.

### “E-mail ou senha incorretos”

Confirme em **Authentication > Users** se o e-mail existe. Se a conta ainda não tiver confirmado o e-mail, conclua primeiro o fluxo de verificação exibido pelo FazAí.

### “Não foi possível enviar”

Confira se o provedor **E-mail/senha** está ativo, se o e-mail está cadastrado e se há conexão com a internet. Para o modo web, confirme também o domínio em **Authentication > Settings > Authorized domains**.

### O e-mail não chega

Verifique spam e promoções, aguarde alguns minutos e confirme se o endereço está correto. No Firebase Console, revise o template **Password reset** e o domínio usado pelo link.

### O navegador mostra domínio não autorizado

Adicione o domínio exibido pelo navegador à lista de **Authorized domains** no Firebase Authentication. Em desenvolvimento, normalmente `localhost` é suficiente; em produção, adicione o domínio final do app.

### O Expo continua usando valores antigos

Pare o servidor Metro e inicie novamente. Se necessário, limpe o cache:

```bash
npx expo start -c
```

## Arquivos relacionados no projeto

- `firebase.js`: inicializa Firebase Authentication e lê as variáveis `EXPO_PUBLIC_FIREBASE_*`.
- `.env.example`: modelo das variáveis necessárias.
- `telas/autenticacao.js`: formulário de login e fluxo **Esqueci minha senha**.
- `componentes/ModalMensagem.js`: modal usado para confirmação, erro e sucesso.
