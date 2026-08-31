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

### Mobile (App do Professor e App do Aluno)
* **React Native** + **Expo**
* **react-native-nfc-manager** (Leitura de Tags)
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
## ⚙️ Como executar o projeto localmente

### Pré-requisitos

- Git;
- Docker Engine;
- Docker Compose;
- Node.js 20 para executar dashboard e mobile.

Não é necessário instalar PostgreSQL diretamente no computador quando o ambiente Docker for utilizado.

### 1. Clonar o repositório

```bash
git clone https://github.com/Uninorte-Extensao/frequencia-premiada.git
cd frequencia-premiada
```

### 2. Preparar as variáveis de ambiente

Copie os arquivos de exemplo:

```bash
cp .env.example .env
cp dashboard/.env.example dashboard/.env
cp mobile/.env.example mobile/.env
```

Os arquivos `.env` reais são ignorados pelo Git. Nunca versione senhas, tokens ou credenciais reais.

Convenção adotada:

| Aplicação | Variável | Finalidade |
|---|---|---|
| Backend | `DATABASE_URL` | Conexão com o PostgreSQL |
| Backend | `JWT_SECRET` | Assinatura dos tokens de autenticação |
| Backend | `PORT` | Porta HTTP da API |
| Backend | `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
| Dashboard | `VITE_API_URL` | URL pública do backend |
| Mobile | `EXPO_PUBLIC_API_URL` | URL do backend acessível pelo dispositivo |

### 3. Subir PostgreSQL e backend

Na raiz do projeto, execute:

```bash
docker compose up --build -d
```

Esse comando:

- cria o PostgreSQL em uma rede interna;
- aguarda o banco ficar saudável;
- constrói o backend;
- executa `prisma migrate deploy`;
- disponibiliza a API em `http://localhost:3333`.

Verifique os serviços:

```bash
docker compose ps
```

Teste a API:

```bash
curl http://localhost:3333/
```

### 4. Criar dados exclusivamente demonstrativos

O seed não é executado automaticamente. Para criar as contas de demonstração:

```bash
docker compose exec backend npm run seed
```

Contas criadas:

- Professor: `professor@escola.com` / `123456`
- Aluno: `ALUNO001` / `123456`

Essas credenciais são destinadas somente ao desenvolvimento e às demonstrações locais.

### 5. Executar o dashboard

Em outro terminal:

```bash
cd dashboard
npm ci
npm run dev
```

Por padrão, o dashboard utiliza:

```dotenv
VITE_API_URL=http://localhost:3333
```

Acesse `http://localhost:5173`.

### 6. Executar o mobile

Em outro terminal:

```bash
cd mobile
npm ci
npm start
```

Em emulador ou navegador local:

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:3333
```

Em celular físico, substitua `localhost` pelo IP local do computador:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.x.x:3333
```

O celular e o computador devem estar conectados à mesma rede.

### Comandos úteis

Acompanhar os logs do backend:

```bash
docker compose logs -f backend
```

Parar os serviços preservando o banco:

```bash
docker compose down
```

Iniciar novamente:

```bash
docker compose up -d
```

As informações do PostgreSQL são preservadas no volume Docker `postgres_data`.