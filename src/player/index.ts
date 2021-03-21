import { Server, Socket } from 'socket.io'
import { Outcome } from '../types/Outcome'
import { AgendaToken } from '../types/AgendaToken'
import { SessionManager } from '../types/SessionManager'
import { Vote } from '../types/Vote'
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
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('hi', () => io.emit('hello'))

  socket.on('player:vote', vote)

  const setOutcomes = (
    sessionId: string,
    ayeOutcomes: Outcome[],
    nayOutcomes: Outcome[]
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.setOutcomes(ayeOutcomes, nayOutcomes)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:setOutcomes', setOutcomes)

  const setAgendaTokens = (
    sessionId: string,
    assignments: { house: string, tokens: AgendaToken[] }[]
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.setAgendaTokens(assignments)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:setAgendaTokens', setAgendaTokens)

  const breakTie = (
    sessionId: string,
    winner: string,
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.breakTie(winner)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:breakTie', breakTie)

  const breakLeaderTie = (
    sessionId: string,
    winner: string,
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.breakLeaderTie(winner)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:breakLeaderTie', breakLeaderTie)

  const gameOver = (
    sessionId: string,
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.gameOver()
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:gameOver', gameOver) // TODO should GM specific actions come from player?

  const selectSecretAgenda = (
    sessionId: string,
    house: string,
    secretAgendaName: string
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.updateSecretAgenda(secretAgendaName, house)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:secretAgenda', selectSecretAgenda) // TODO should GM specific actions come from player?

  const selectSecretAgenda = (
    sessionId: string,
    house: string,
    secretAgendaName: string
  ) => {
    const session = sessionManager.getSession(sessionId)
    session.updateSecretAgenda(secretAgendaName, house)
    io.emit('game:state', session.getState()) //TODO verify this is correct
  }

  socket.on('player:newPlayer', selectPlayer) // TODO should GM specific actions come from player?

}
