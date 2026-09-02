import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes'
import turmaRoutes from './routes/turmaRoutes'
import alunoRoutes from './routes/alunoRoutes'
import disciplinaRoutes from './routes/disciplinaRoutes'
import checkinRoutes from './routes/checkinRoutes'
import presencaRoutes from './routes/presencaRoutes'
import lgpdRoutes from './routes/lgpdRoutes'
import professorRoutes from './routes/professorRoutes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/presencas', presencaRoutes)
app.use('/auth', authRoutes)
app.use('/turmas', turmaRoutes)
app.use('/alunos', alunoRoutes)
app.use('/disciplinas', disciplinaRoutes)
app.use('/checkin', checkinRoutes)
app.use('/lgpd', lgpdRoutes)
app.use('/professores', professorRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Frequência Premiada API rodando! 🚀' })
})

export { app }
