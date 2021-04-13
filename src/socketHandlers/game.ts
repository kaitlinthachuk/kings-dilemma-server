import { Server, Socket } from 'socket.io'
import { Session } from '../types/Session'
const session = Session.getInstance()

export default (io: Server, socket: Socket) => {
  socket.on('game:getState', () => {
    socket.emit('game:state', session.getState())
  })

  socket.on('game:start', () => {
    session.startGame()
    io.emit('game:state', session.getState())
  })

  socket.on('game:setMessage', (message) => {
    session.message = message
    io.emit('game:state', session.getState())
  })
}
