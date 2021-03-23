import { Server, Socket } from 'socket.io'
import { Outcome } from '../types/Outcome'
import { AgendaToken } from '../types/AgendaToken'
import { Session } from '../types/Session'
import { Vote } from '../types/Vote'
const session = Session.getInstance()

export default (io: Server, socket: Socket) => {
  const selectHouse = (house: string) => {
    session.addPlayer(house)
    io.emit('game:state', session.getState())
  }

  const selectSecretAgenda = (house: string, secretAgendaName: string) => {
    session.updateSecretAgenda(secretAgendaName, house)
    io.emit('game:state', session.getState())
  }

  const vote = (vote: Vote) => {
    session.updateVote(vote)
    io.emit('game:state', session.getState())
  }

  const setOutcomes = (ayeOutcomes: Outcome[], nayOutcomes: Outcome[]) => {
    session.setOutcomes(ayeOutcomes, nayOutcomes)
    io.emit('game:state', session.getState())
  }

  const setAgendaTokens = (
    assignments: { house: string; tokens: AgendaToken[] }[],
  ) => {
    session.setAgendaTokens(assignments)
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
  socket.on('player:setOutcomes', setOutcomes)
  socket.on('player:setAgendaTokens', setAgendaTokens)
  socket.on('player:breakTie', breakTie)
  socket.on('player:breakLeaderTie', breakLeaderTie)
  socket.on('player:gameOver', gameOver) // TODO should GM specific actions come from player?
}
