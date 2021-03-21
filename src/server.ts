import http, { Server as HTTPServer } from 'http'
import app from './app'
import { Server, Socket } from 'socket.io'
import registerPlayerHandlers from './player'

const initServer = (): HTTPServer => {
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET', 'POST']
    }
  })


  io.on('connection', (socket: Socket) => {
    console.log('received connection to socket')
    registerPlayerHandlers(io, socket)
  })

  return httpServer
}

export default initServer
