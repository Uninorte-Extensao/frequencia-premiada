# Deploy do EduPoints: Neon + Render + Vercel

O PostgreSQL fica no Neon, a API Node.js no Render e o dashboard na Vercel.
O aplicativo Android é distribuído separadamente. Nunca coloque senhas,
tokens ou a URL real do banco no Git.

## Antes de começar

1. Mantenha a branch `main` e os checks do GitHub Actions atualizados.
2. Tenha acesso ao projeto Neon, ao serviço da API no Render e ao projeto Vercel.
3. Use uma URL de conexão do banco correto; confira projeto, branch e banco no Neon.
4. Não execute `npm run seed` no banco publicado: o seed atual cria contas
   demonstrativas com senha conhecida.

## 1. Banco PostgreSQL no Neon

1. Crie um projeto no Neon e selecione a branch de produção e o banco desejado.
2. Em **Connect**, copie a connection string **direta**, com a opção de conexão
   pooled desmarcada. Não cole essa URL em issues, PRs ou mensagens.
3. Na pasta `backend`, aplique as migrations da versão que será publicada:

   ```bash
   npm ci
   read -r -s -p "URL do Neon: " neon_database_url
   printf '\n'
   DATABASE_URL="$neon_database_url" npx prisma migrate deploy
   DATABASE_URL="$neon_database_url" npx prisma migrate status
   ```

4. Confirme a mensagem `Database schema is up to date!`.

O comando `migrate deploy` cria ou atualiza as tabelas; ele não cadastra
alunos, turmas ou contas. O banco novo começa sem esses dados.

### Primeira conta administrativa

O cadastro normal de professor exige um admin autenticado. Em um banco novo,
crie a primeira conta admin por um procedimento pontual, com senha forte
armazenada somente como hash bcrypt. Verifique que não existem contas na tabela
`Professor` antes da criação. Não use o seed demonstrativo e não registre a
senha ou seu hash na documentação.

Depois de criar a conta, teste o login pelo dashboard. Cadastre os professores,
turmas e alunos pelos fluxos autorizados da aplicação. Não repita a criação da
primeira conta em um banco que já tenha usuários.

Ao terminar as operações locais com o banco, remova a URL da variável da sessão:

```bash
unset neon_database_url
```

## 2. API no Render

O arquivo `render.yaml` configura o serviço `frequencia-premiada-api`, com
diretório raiz `backend`, build do Prisma/TypeScript, comando
`npm run start:render` e endpoint `/health`.

1. Crie ou abra o Web Service no Render conectado à branch publicada.
2. Em **Environment**, configure `DATABASE_URL` com a connection string do
   **Neon correto**. Para um Blueprint novo, `sync: false` solicita o valor
   durante a criação. Em um serviço existente, configure a variável manualmente.
3. Configure `JWT_SECRET` com um segredo próprio e `CORS_ORIGINS` com a URL
   exata do dashboard, sem barra final. Mantenha `NODE_ENV=production`.
4. Se estiver preparando uma mudança de código, use **Save only** para guardar
   variáveis sem iniciar um deploy antecipado; faça o deploy da versão correta
   em seguida.
5. Confira no log se `prisma migrate deploy` terminou e se a API iniciou.
6. Verifique:

   ```bash
   curl https://frequencia-premiada-api.onrender.com/health
   ```

O endpoint `/health` verifica que o servidor responde. Para confirmar a
conexão com o Neon, teste também o login de uma conta existente no banco.

## 3. Dashboard na Vercel

1. Importe o repositório na Vercel com **Root Directory** igual a `dashboard`.
2. Use Vite, `npm ci` para instalar, `npm run build` para compilar e `dist`
   como diretório de saída.
3. Configure a variável de ambiente:

   ```dotenv
   VITE_API_URL=https://frequencia-premiada-api.onrender.com
   ```

4. Faça o deploy e abra o dashboard.
5. No Render, ajuste `CORS_ORIGINS` para a URL exata da Vercel, sem barra final.
   Separe múltiplas origens confiáveis por vírgula; não use `*` em produção.

O arquivo `dashboard/vercel.json` permite abrir diretamente as rotas internas
do React Router sem erro 404.

## 4. Checklist de publicação

- GitHub Actions passou na versão publicada;
- API no Render está **Live** e `/health` retorna HTTP 200;
- logs não mostram erro de migration nem de conexão com o banco;
- login da conta admin funciona pelo dashboard;
- telas vazias refletem o banco novo, sem dados fictícios;
- não há erro de CORS no navegador;
- nenhuma senha, token, `.env` ou URL real de banco foi commitada.

## Limites e dados

O banco gratuito antigo do Render expira após 30 dias; o projeto publicado usa
o Neon. Os planos gratuitos do Render e do Neon têm limites de uso que devem
ser acompanhados nos respectivos painéis. O serviço web gratuito do Render
pode adormecer por inatividade, causando demora na primeira requisição.

Antes de usar dados pessoais reais em uma escola, defina responsáveis,
controle de acesso, política de backup e um plano de hospedagem adequado.
