import { Server, Socket as _Socket } from 'socket.io'
import { Outcome } from '../types/Outcome'
import { AgendaToken } from '../types/AgendaToken'
import { Session } from '../types/Session'
import { Vote } from '../types/Vote'
const session = Session.getInstance()

type Socket = _Socket & { house: string }

export default (io: Server, socket: Socket) => {
  const selectHouse = (house: string) => {
    console.log({ house })
    session.addPlayer(house)
    socket.house = house // add house to socket object
    io.emit('game:state', session.getState())
  }

  const selectSecretAgenda = (secretAgendaName: string) => {
    session.updateSecretAgenda(socket.house, secretAgendaName)
    io.emit('game:state', session.getState())
  }

  const vote = (vote: Vote) => {
    session.updateVote(vote)
    io.emit('game:state', session.getState())
  }

  const breakTie = (winner: string) => {
    session.breakTie(winner)
    io.emit('game:state', session.getState())
  }

  const breakLeaderTie = (winner: string) => {
    session.breakLeaderTie(winner)
    io.emit('game:state', session.getState())
  }

  const updateCrave = (crave: number) => {
    session.updateCrave(socket.house, crave)
    io.emit('game:state', session.getState())
  }

  const updatePrestige = (prestige: number) => {
    session.updatePrestige(socket.house, prestige)
    io.emit('game:state', session.getState())
  }

  const gameOver = () => {
    session.endGame()
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
  socket.on('player:crave', updateCrave)
  socket.on('player:prestige', updatePrestige)
  socket.on('player:gameOver', gameOver) // TODO should GM specific actions come from player?
}
