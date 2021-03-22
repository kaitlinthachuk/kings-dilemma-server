import { Server, Socket } from 'socket.io'
import { Outcome } from '../types/Outcome'
import { AgendaToken } from '../types/AgendaToken'
import { SessionManager } from '../types/SessionManager'
import { Vote } from '../types/Vote'
const sessionManager = SessionManager.getInstance()

export default (io: Server, socket: Socket) => {
  socket.on('player:join', ({sessionId}) => {
    const session = sessionManager.getSession(sessionId)
    socket.join(sessionId) // join room
    socket.emit('game:state', session.getState())
  })

  socket.on('player:selectHouse', ({sessionId, house}) => {
    const session = sessionManager.getSession(sessionId)
    session.addPlayer(house)
    socket.to(sessionId).emit('game:state', session.getState())
  })

  socket.on('player:selectSecretAgenda', ({sessionId, house, secretAgendaName}) => {
    const session = sessionManager.getSession(sessionId)
    session.updateSecretAgenda(secretAgendaName, house)
    socket.to(sessionId).emit('game:state', session.getState())
  })

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


  socket.on('player:breakTie', ({sessionId, winner}) => {
    const session = sessionManager.getSession(sessionId)
    session.breakTie(winner)
    socket.to(sessionId).emit('game:state', session.getState())
  })

  socket.on('player:breakLeaderTie', ({sessionId, winner}) => {
    const session = sessionManager.getSession(sessionId)
    session.breakLeaderTie(winner)
    socket.to(sessionId).emit('game:state', session.getState())
  })

  socket.on('player:gameOver', ({sessionId}) => {
    const session = sessionManager.getSession(sessionId)
    session.endGame()
    socket.to(sessionId).emit('game:state', session.getState())
  }) // TODO should GM specific actions come from player?
}
