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
## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o projeto na sua máquina. **Importante:** certifique-se de ter o [Node.js](https://nodejs.org/) e o [PostgreSQL](https://www.postgresql.org/) instalados.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Uninorte-Extensao/frequencia-premiada.git](https://github.com/Uninorte-Extensao/frequencia-premiada.git)
cd frequencia-premiada