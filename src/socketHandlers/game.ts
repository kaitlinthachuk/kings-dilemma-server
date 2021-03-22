import { Server, Socket } from 'socket.io'
import { SessionManager } from '../types/SessionManager'
const sessionManager = SessionManager.getInstance()

export default (io: Server, socket: Socket) => {
  socket.on('game:start', ({ sessionId }) => {
    const session = sessionManager.getSession(sessionId)
    session.startGame()
    socket.to(sessionId).emit('game:state', session.getState())
  })
}
