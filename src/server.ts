import http from 'http'
import app from './app'
import { Server, Socket } from 'socket.io'
import registerPlayerHandlers from './player'

const PORT = process.env.PORT || 8080

const httpServer = http.createServer(app)
const io = new Server(httpServer)

io.on('connection', (socket: Socket) => {
  console.log('received connection to socket')
  registerPlayerHandlers(io, socket)
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`)
})
