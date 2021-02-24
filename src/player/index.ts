import { Server, Socket } from 'socket.io'
import * as handlers from './player.handler'

export default (io: Server, socket: Socket) => {
  socket.on('player:vote', handlers.vote)
}
