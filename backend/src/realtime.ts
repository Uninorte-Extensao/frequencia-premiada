import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'

let io: Server | null = null

export const inicializarRealtime = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log(`✅ Dashboard conectado: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`❌ Dashboard desconectado: ${socket.id}`)
    })
  })

  return io
}

export const emitirEvento = (evento: string, dados: unknown) => {
  io?.emit(evento, dados)
}
