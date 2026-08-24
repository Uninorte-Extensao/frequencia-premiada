# EduPoints - Frequência Premiada 🏆🎓

O **EduPoints** é uma solução EdTech voltada para a automação do controle de presença e prevenção da evasão escolar em escolas públicas. Utilizando tags NFC adesivas de baixo custo e gamificação, o sistema transforma a tradicional chamada manual em um evento interativo, garantindo visibilidade em tempo real para a gestão escolar.

---

## 👥 A Equipe

Este projeto é mantido pela equipe da disciplina de Extensão / Fábrica de Software:

* **Erick Saraiva (Matrícula: 03326100)** — Tech Lead / DevOps (Infraestrutura, Banco de Dados e CI/CD)
* **Marilia Yasmim (Matrícula: 03339308)** — Backend (APIs, Regras de Negócio e LGPD)
* **Victor Gabriel (Matrícula: 03341215)** — Frontend Web (Dashboard e Socket.io)
* **Juliane de Oliveira (Matrícula: 03339179)** — Mobile (React Native e Integração NFC)
* **Marcela Caldas (Matrícula: 03324397)** — Produto, Documentação e Impacto Social (QA, Notion e Trello)

---

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

## ⚙️ Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o projeto na sua máquina. **Importante:** certifique-se de ter o [Node.js](https://nodejs.org/) e o [PostgreSQL](https://www.postgresql.org/) instalados.

### 1. Clonar o Repositório
```bash
git clone [https://github.com/Uninorte-Extensao/frequencia-premiada.git](https://github.com/Uninorte-Extensao/frequencia-premiada.git)
cd frequencia-premiada