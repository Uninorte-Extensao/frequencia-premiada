# FREQ-014 — Validação

Card: https://trello.com/c/JdR5ejFS

## Configuração aprovada para implementação

- Versão dos termos: `1.0`
- Responsável informado: Erick Saraiva
- Contato informado: juliane.oliveira.pinto@gmail.com
- Decisão obrigatória: `Li e estou ciente`

O texto deve ser validado com Marcela conforme a dependência FREQ-017 antes do merge definitivo.

## Roteiro

1. Aplicar as migrações do Prisma e iniciar a API.
2. Entrar com aluno cujo `primeiro_acesso` seja `true`.
3. Confirmar que nenhuma aba do aluno é exibida antes da ciência.
4. Desligar a API, validar estado offline e botão de nova tentativa.
5. Reativar a API, ler os termos e tocar em `Li e estou ciente`.
6. Confirmar no banco `primeiro_acesso=false`, `termo_versao=1.0` e `termo_ciente_em` preenchido.
7. Reabrir o aplicativo e confirmar que a sessão restaura diretamente na navegação do aluno.
8. No perfil, conferir apelido/nome, matrícula mascarada, turma e pontos reais.
9. Usar `Baixar/compartilhar meus dados` e conferir a exportação do próprio titular.
10. Tentar acessar a exportação de outro aluno e confirmar HTTP 403.

## Quality gates

```bash
cd backend && npm run build && npm test
cd ../mobile && npm run typecheck
```
