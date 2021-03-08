import { Server, Socket } from 'socket.io'
import { SessionManager} from '../types/SessionManager'
const sessionManager = SessionManager.getInstance()

export default (io: Server, socket: Socket) => {

const vote = (
  sessionId: string,
  house: string,
  vote: Vote,
) => {
  console.log(`${house} voted ${vote.type} with ${vote.power}`)
  const session = sessionManager.getSession(sessionId)
  session.updateVote(vote)
}

  socket.on('player:vote', vote)
  io.to('room-0').emit('') // TODO
}
