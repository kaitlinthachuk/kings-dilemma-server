import { Server, Socket as _Socket } from 'socket.io'
import { Session } from '../types/Session'
import { Vote } from '../types/Vote'
const session = Session.getInstance()

type Socket = _Socket & { house: string }

export default (io: Server, socket: Socket) => {
  const selectHouse = (house: string, prestige: number, crave: number) => {
    session.addPlayer(house, prestige, crave)
    socket.house = house // add house to socket session for this client
    io.emit('game:state', { from: socket.house, ...session.getState() })
  }

  const selectSecretAgenda = (secretAgendaName: string) => {
    session.updateSecretAgenda(socket.house, secretAgendaName)
    io.emit('game:state', session.getState())
  }

  const vote = (vote: Vote) => {
    session.updateVote(vote)
    io.emit('game:state', { from: socket.house, ...session.getState() })
  }

  const breakTie = (winner: string) => {
    session.breakTie(winner)
    io.emit('game:state', session.getState())
  }

  const breakLeaderTie = (winner: string) => {
    session.breakLeaderTie(winner)
    io.emit('game:state', session.getState())
  }

  socket.on('player:join', () => {
    socket.emit('game:state', session.getState()) // only emit to client
  })
  socket.on('player:selectHouse', selectHouse)
  socket.on('player:selectSecretAgenda', selectSecretAgenda)
  socket.on('player:vote', vote)
  socket.on('player:breakTie', breakTie)
  socket.on('player:breakLeaderTie', breakLeaderTie)
}
