# EduPoints - Frequência Premiada 🏆🎓

O **EduPoints** é uma solução EdTech voltada para a automação do controle de presença e prevenção da evasão escolar em escolas públicas. Utilizando tags NFC adesivas de baixo custo e gamificação, o sistema transforma a tradicional chamada manual em um evento interativo, garantindo visibilidade em tempo real para a gestão escolar.

---

## 👥 A Equipe

Este projeto é mantido pela equipe **OTAN** para as disciplinas de Extensão / Fábrica de Software / Tópicos Avançados / DeVops:

* **Erick Saraiva (Matrícula: 03326100)** — Tech Lead / DevOps (Focado na infraestrutura, CI/CD com GitHub Actions, Docker, gerenciamento do repositório Git e suporte geral)
* **Marilia Yasmim (Matrícula: 03339308)** — Frontend Web / Dashboard (Melhorias no painel dos professores, telas de relatórios de evasão e gráficos de presença em tempo real)
* **Victor Gabriel (Matrícula: 03341215)** — Backend & Banco de Dados (Evolução das rotas da API, regras de LGPD, segurança e otimização de consultas no Prisma)
* **Juliane de Oliveira (Matrícula: 03339179)** — Mobile / React Native (Evolução do App do Aluno (telas de login, perfil, histórico e gamificação/ranking))
* **Marcela Caldas (Matrícula: 03324397)** — Documentação, Impacto Social & Extensão (Focado em coletar métricas de impacto escolar, documentação no Trello, preparação de apresentações e validação com os usuários da extensão)

## 🚀 Tecnologias Utilizadas

O sistema possui uma arquitetura orientada a eventos baseada inteiramente em **TypeScript**:

### Backend (API REST & WebSocket)
* **Node.js** + **Express**
* **Prisma ORM (v5)** + **PostgreSQL 17**
* **Socket.io** (Emissão de check-ins em tempo real)
* **JWT** & **Bcrypt** (Autenticação e Segurança com separação de *Roles*)

### Frontend (Dashboard da Direção/Professores)
* **React** + **Vite**
* **Axios** + **Socket.io-client**
* Dark Theme (focado em redução de fadiga visual)

### Mobile (aplicativo único para professor e aluno)
* **React Native** + **Expo**
* **react-native-nfc-manager** (Leitura e vínculo de tags NFC)
* **react-native-safe-area-context** (Adaptação às áreas seguras do Android)
* **Expo EAS Build** (Geração de APKs internos para testes)
* Design focado em "Chamada em 2 toques"

---
## 📌 Regras de Negócio e LGPD
* **Check-in Físico e Antifraude:** O aplicativo Mobile do aluno é *Read-Only*. O registro de presença ocorre estritamente na escola através do leitor NFC do professor.
* **Privacidade (LGPD):** Para evitar constrangimentos, o ranking exibe apenas apelidos/iniciais. O sistema suporta portabilidade e anonimização de dados.
* **Gamificação:** Sistema de pontuação (+10 pontos por presença) para engajamento e redução da evasão.

## 🚀 Roadmap e Implementações Futuras
- [ ] **Machine Learning:** Modelo preditivo para alerta de evasão antes da 3ª falta.
- [ ] **Modo Offline:** Sincronização local para escolas com instabilidade de rede.
- [ ] **Dashboard SEMED:** Painel consolidado de dados para a Secretaria de Educação.
- [ ] **Integração MEC/Censo Escolar:** Exportação padronizada de dados.

---
## 📱 Como acessar o sistema

O EduPoints possui serviços publicados para demonstração e um aplicativo
Android instalável.

### Dashboard web

O painel web está disponível em:

- [Acessar o dashboard do EduPoints](https://frequencia-premiada.vercel.app)

### Aplicativo Android

O aplicativo Android é distribuído como APK para testes em dispositivos
físicos:

- [Baixar APK de testes — versão 1.0.0, build 4](https://expo.dev/accounts/ericksaraiva/projects/edupoints/builds/7db346e0-ba61-471a-bedc-af871a7951ad)

#### Funcionalidades validadas no build 4

* Login de aluno e professor no mesmo aplicativo, com navegação por perfil.
* Aluno com acesso somente ao próprio histórico, pontos e perfil.
* Professor autorizado a cadastrar tags NFC e registrar presença.
* Vínculo persistente entre a tag física e o aluno.
* Fluxo completo validado: leitura da tag, presença registrada e pontos atualizados.
* Interface adaptada às áreas seguras e à navegação do Android.

Para instalar:

1. Acesse o link pelo dispositivo Android.
2. Baixe o arquivo APK.
3. Autorize temporariamente a instalação pelo navegador ou gerenciador de arquivos.
4. Instale ou atualize o EduPoints.
5. Abra o aplicativo e realize a autenticação.

Baixe o aplicativo somente pelos links oficiais deste projeto. As versões
homologadas futuramente serão disponibilizadas na página de Releases do GitHub.

### API

A disponibilidade da API pode ser consultada pelo endpoint:

- [Verificar estado da API](https://frequencia-premiada-api.onrender.com/health)

Em hospedagens gratuitas, a primeira resposta pode demorar alguns segundos
enquanto o serviço é inicializado.

## 🧑‍💻 Desenvolvimento local

As instruções para clonar, configurar e executar o sistema localmente foram
separadas da documentação destinada aos usuários:

- [Consultar o guia de desenvolvimento](docs/DEVELOPMENT.md)

## 🌐 Publicação

O dashboard é publicado na Vercel, a API Node.js no Render e o banco
PostgreSQL no Neon. A API se conecta ao Neon pela variável `DATABASE_URL`,
configurada como segredo no Render. Consulte o passo a passo em
[`DEPLOY.md`](DEPLOY.md).
