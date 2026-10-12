# FREQ-013 — Validação

## Configuração

Crie `mobile/.env` com `EXPO_PUBLIC_API_URL` apontando para a API acessível pelo dispositivo Android. O arquivo `.env` não deve ser versionado.

## Matriz de acesso

| Operação | Aluno | Professor |
|---|---:|---:|
| Consultar o próprio histórico e pontos | Sim | Não aplicável |
| Consultar ranking da própria turma | Sim | Sim |
| Consultar turmas e chamadas | Não | Sim |
| Registrar presença por NFC/manual | Não | Sim |
| Encerrar chamada, editar ou justificar | Não | Sim |

As rotas do professor não são registradas no navegador do aluno. O backend aplica `autorizarRole(['professor'])` às operações de escrita.

## Roteiro Android

1. Entrar como aluno, validar home, frequência, ranking, perfil, restauração e logout.
2. Entrar como professor, abrir uma turma, registrar NFC e manual, acompanhar presentes e encerrar chamada.
3. Reabrir o aplicativo autenticado em cada papel e confirmar a restauração correta.
4. Usar um token de aluno em `POST /checkin` e confirmar resposta HTTP 403.
5. Executar `npm run typecheck` em `mobile` e `npm run build` em `backend`.
6. Gerar o APK com `eas build --platform android --profile preview` e instalar em dispositivo físico.

## Decisão sobre armazenamento

O token permanece temporariamente no AsyncStorage porque `expo-secure-store` está condicionado à aprovação técnica no card. A sessão foi centralizada para permitir a troca futura do mecanismo de armazenamento em um único arquivo (`sessionStorage.ts`). Nenhum token é escrito em logs.

