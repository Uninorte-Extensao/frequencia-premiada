# 🎓 EduPoints — Frequência Premiada

> Solução EdTech que combate a evasão escolar em Manaus via gamificação e NFC

![Stack](https://img.shields.io/badge/Stack-TypeScript-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![LGPD](https://img.shields.io/badge/LGPD-Conforme-brightgreen)

## 📌 Sobre o projeto

O **EduPoints** automatiza o controle de presença em escolas públicas através de **tags NFC adesivas** (R$1–3 cada) e gamificação, transformando a chamada manual em um evento de engajamento. O sistema fornece dados em tempo real para a **Busca Ativa** de alunos em risco de abandono.

**Desenvolvido para:** Tópicos Integradores em Ciência da Computação — UNINORTE  
**Orientador:** Professor Francisco  
**Desenvolvedor:** Erick Saraiva

---

## 🏗️ Arquitetura

---

## 🚀 Stack tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native + Expo + react-native-nfc-manager |
| Backend | Node.js + Express + Socket.io |
| Banco | PostgreSQL + Prisma ORM v5 |
| Dashboard | React + Vite |
| Auth | JWT + bcrypt |
| Deploy Mobile | EAS Build (Expo) |
| Tunnel Dev | Ngrok |

---

## ✅ Requisitos funcionais implementados

| RF | Descrição | Status |
|----|-----------|--------|
| RF01 | Registro de presença via tag NFC | ✅ |
| RF02 | +10 pontos por check-in automático | ✅ |
| RF03 | Seleção de turma/disciplina/professor | ✅ |
| RF04 | Edição manual com auditoria | ✅ |
| RF05 | Alerta de risco de evasão (3+ faltas) | ✅ |

---

## 📦 Como rodar o projeto

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- Expo CLI + EAS CLI

### Backend

```bash
cd backend
npm install
cp .env.example .env   # configure DATABASE_URL e JWT_SECRET
npx prisma migrate dev --name init
npm run dev
```

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
eas build --platform android --profile preview
```

---

## 🔐 Endpoints principais

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /auth/login | Login professor | ❌ |
| POST | /checkin | Registrar presença NFC | JWT |
| GET | /checkin/risco | Alunos em risco de evasão | JWT |
| GET | /alunos/ranking/:turmaId | Ranking de pontos | JWT |
| PUT | /presencas/:id | Editar presença com auditoria | JWT |
| GET | /lgpd/info | Informações LGPD | 
| GET | /lgpd/alunos/:id/dados | Exportar dados (portabilidade) | JWT |
| DELETE | /lgpd/alunos/:id | Anonimizar dados | JWT |

---

## ⚖️ LGPD

O sistema trata dados de menores de idade com base no **Art. 7, Inciso III da LGPD** (execução de políticas públicas). Implementa portabilidade, anonimização e auditoria completa.

---

## 📄 Licença e Direitos Autorais
Copyright (c) 2026 Erick Saraiva
