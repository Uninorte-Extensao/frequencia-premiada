import 'dotenv/config'
import http from 'http'
import { app } from './app'
import { inicializarRealtime } from './realtime'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não está definida nas variáveis de ambiente')
}

const httpServer = http.createServer(app)
inicializarRealtime(httpServer)

const PORT = process.env.PORT || 3333

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
  })
}

export { httpServer }
