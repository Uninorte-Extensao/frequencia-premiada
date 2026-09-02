# Backend

API do projeto Frequência Premiada, construída com Express, Prisma e Socket.IO.

## Como rodar

Na pasta `backend`:

```powershell
npm ci --include=dev
npm run build
npm run dev
```

Variáveis usadas pelo projeto:

- `DATABASE_URL`: conexão com o PostgreSQL.
- `JWT_SECRET`: assinatura dos tokens JWT.
- `PORT`: porta da API. Se não for informada, será usada a porta `3333`.

Para confirmar que a API está respondendo, use `GET /`.

## Rotas de autenticação

As rotas oficiais para professor são:

- `POST /auth/login`
- `POST /auth/cadastrar`

As rotas abaixo foram mantidas para não quebrar integrações antigas, mas usam o mesmo `authController`:

- `POST /professores/login` → mesmo comportamento de `/auth/login`
- `POST /professores` → mesmo comportamento de `/auth/cadastrar`

Novas integrações devem usar as rotas iniciadas por `/auth`.

O login do aluno continua disponível em `POST /alunos/login`.

## Demais rotas

Com exceção das rotas de login e de `GET /lgpd/info`, as rotas abaixo exigem token JWT. A separação por papel será feita na FREQ-006.

### Turmas e disciplinas

- `GET /turmas`
- `POST /turmas`
- `GET /turmas/ranking`
- `GET /disciplinas`
- `POST /disciplinas`

### Alunos

- `POST /alunos`
- `GET /alunos/turma/:turmaId`
- `GET /alunos/tag/:nfc_uid`
- `GET /alunos/ranking/:turmaId`
- `PATCH /alunos/vincular-nfc`

### Presenças

- `POST /checkin`
- `GET /checkin`
- `GET /checkin/turma/:turmaId`
- `GET /checkin/risco`
- `POST /checkin/encerrar`
- `GET /presencas`
- `POST /presencas`
- `PUT /presencas/:id`
- `POST /presencas/justificada`
- `GET /presencas/auditoria`

Os fluxos `/checkin` e `/presencas` ainda possuem regras separadas. Eles serão unificados na FREQ-007. Até lá, nenhum dos dois deve ser removido.

### LGPD

- `GET /lgpd/info`
- `GET /lgpd/alunos/:id/dados`
- `DELETE /lgpd/alunos/:id`

As regras completas de autorização, auditoria e anonimização serão tratadas nas FREQ-006 e FREQ-008.

## Organização da aplicação

- `src/app.ts`: configura o Express e registra as rotas.
- `src/server.ts`: cria o servidor HTTP, inicializa o Socket.IO e abre a porta.
- `src/realtime.ts`: concentra a inicialização e a emissão dos eventos Socket.IO.

Testes devem importar `app` de `src/app.ts`. Importar `server.ts` durante os testes inicia o servidor HTTP.
