import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import turmaRoutes from './routes/turmaRoutes'
import alunoRoutes from './routes/alunoRoutes'
import disciplinaRoutes from './routes/disciplinaRoutes'
import checkinRoutes from './routes/checkinRoutes'
import presencaRoutes from './routes/presencaRoutes'
import lgpdRoutes from './routes/lgpdRoutes'
import professorRoutes from './routes/professorRoutes' // 👈 1. Importe as rotas do professor aqui

dotenv.config()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definida nas variáveis de ambiente')
}
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
})

app.use(cors({ origin: corsOrigins }))
app.use(express.json())
app.use('/presencas', presencaRoutes)

// Rotas da API
app.use('/auth', authRoutes)
app.use('/turmas', turmaRoutes)
app.use('/alunos', alunoRoutes)
app.use('/disciplinas', disciplinaRoutes)
app.use('/checkin', checkinRoutes)
app.use('/lgpd', lgpdRoutes)
app.use('/professores', professorRoutes) // 👈 2. Registre o endpoint do professor aqui

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Frequência Premiada API rodando! 🚀' })
})

// Socket.io — conexão em tempo real
io.on('connection', (socket) => {
  console.log(`✅ Dashboard conectado: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`❌ Dashboard desconectado: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3333

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
})

export { io, app }
