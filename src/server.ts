import http, { Server as HTTPServer } from 'http'
import app from './app'
import { Server, Socket } from 'socket.io'
import registerPlayerHandlers from './socketHandlers/player'
import registerGameHandlers from './socketHandlers/game'

const initServer = (): HTTPServer => {
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket: Socket) => {
    registerPlayerHandlers(io, socket)
    registerGameHandlers(io, socket)
  })

  return httpServer
}

export default initServer
