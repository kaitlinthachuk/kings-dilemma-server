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

  socket.on('game:done', () => {
    session.endGame()
    io.emit('game:state', session.getState())
  })

  socket.on('game:setMessage', (message) => {
    session.message = message
    io.emit('game:state', session.getState())
  })

  socket.on('game:setTurn', (player) => {
    session.turn = player
    io.emit('game:state', session.getState())
  })

  socket.on('game:setLeader', (player) => {
    session.leader = player
    io.emit('game:state', session.getState())
  })

  socket.on('game:setModerator', (player) => {
    session.moderator = player
    io.emit('game:state', session.getState())
  })

  socket.on('game:setAvailablePower', (power) => {
    session.availablePower = power
    io.emit('game:state', session.getState())
  })

  socket.on('game:setState', (state) => {
    session.state = state
    io.emit('game:state', session.getState())
  })

  socket.on('game:setLeaderTie', (bool) => {
    session.leaderTie = bool
    io.emit('game:state', session.getState())
  })

  socket.on('game:setVoteTie', (bool) => {
    session.voteTie = bool
    io.emit('game:state', session.getState())
  })

  socket.on('game:setBecomeMod', (bool) => {
    session.becomeModAvailable = bool
    io.emit('game:state', session.getState())
  })

  socket.on('game:setWinner', (winner) => {
    session.winner = winner
    io.emit('game:state', session.getState())
  })

  socket.on('game:setAgendaToken', (house, agendaToken) => {
    session.setAgendaToken(house, agendaToken)
    io.emit('game:state', session.getState())
  })

  socket.on('game:removeAgendaToken', (house, agendaToken) => {
    session.removeAgendaToken(house, agendaToken)
    io.emit('game:state', session.getState())
  })

  socket.on('game:addOutcome', (side, outcome) => {
    session.addOutcome(side, outcome)
    io.emit('game:state', session.getState())
  })

  socket.on('game:removeOutcome', (outcome) => {
    session.removeOutcome(outcome)
    io.emit('game:state', session.getState())
  })

  socket.on('game:startVoting', () => {
    session.startVoting()
    io.emit('game:state', session.getState())
  })

  socket.on('game:updateChronicleUrl', (url) => {
    session.chronicleStickersUrl = url
    io.emit('game:state', session.getState())
  })

  socket.on('game:updateVotingCardUrl', (url) => {
    session.votingCardUrl = url
    io.emit('game:state', session.getState())
  })

  socket.on('game:reset', () => {
    session.resetInstance()
    io.emit('game:state', session.getState())
  })

  socket.on('game:updatePower', (value, house) => {
    session.players[house].power = value
    io.emit('game:state', session.getState())
  })

  socket.on('game:updateCoin', (value, house) => {
    session.players[house].coins = value
    io.emit('game:state', session.getState())
  })
}
