import { io, Socket } from 'socket.io-client'
import initServer from '../src/server'
import { Server as HTTPServer } from 'http'
import { Session } from '../src/types/Session'
import { State } from '../src/types/State'
import { Server } from 'socket.io'

describe('Gameplay tests', () => {
  let httpServer: HTTPServer
  let serverSocket: Server
  let clients: Record<string, Socket>
  const session = Session.getInstance()
  const createClient = (port: string, player: string): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const socket = io(`http://localhost:${port}`)
      // @ts-ignore
      socket.house = player // add house to client socket object
      socket.on('connect', () => resolve(socket))
      setTimeout(() => {
        reject(new Error('failed to connect :('))
      }, 5000)
    })
  }

  const ackEmit = (
    socket: Socket,
    event: string,
    ...args: any[]
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      socket.on('game:state', (gameState: Record<string, unknown>) => {
        // @ts-ignore
        if (gameState.from === socket.house) {
          // only resovle if gamestate response is from this players request
          resolve()
        }
      })
      socket.emit(event, ...args)
    })
  }

  beforeAll(async (done) => {
    ;[httpServer, serverSocket] = initServer()
    httpServer.listen(async () => {
      const players = ['tork', 'solad', 'crann', 'coden', 'tiryll']
      // @ts-ignore
      const port = httpServer.address().port
      const sockets = await Promise.all(
        players.map((player) => createClient(port, player)),
      )
      clients = Object.fromEntries(
        players.map((_, i) => [players[i], sockets[i]]),
      )

      done()
    })
  })

  beforeEach(async (done) => {
    session.resetInstance()
    await ackEmit(clients.tork, 'player:selectHouse', 'tork', 5, 2)
    await ackEmit(clients.solad, 'player:selectHouse', 'solad', 4, 3)
    await ackEmit(clients.crann, 'player:selectHouse', 'crann', 6, 1)
    await ackEmit(clients.coden, 'player:selectHouse', 'coden', 1, 10)
    await ackEmit(clients.tiryll, 'player:selectHouse', 'tiryll', 2, 7)
    session.startGame()
    session.updateSecretAgenda('tork', session.secretAgendas[0].name)
    session.updateSecretAgenda('solad', session.secretAgendas[0].name)
    session.updateSecretAgenda('crann', session.secretAgendas[0].name)
    session.updateSecretAgenda('coden', session.secretAgendas[0].name)
    session.updateSecretAgenda('tiryll', session.secretAgendas[0].name)
    done()
  })

  afterAll((done) => {
    Object.values(clients).forEach((client) => client.close())
    serverSocket.close()
    httpServer.close(done)
  })

  it('has all the players', () => {
    expect(Object.keys(session.players)).toHaveLength(5)
    expect(session.state).toBe(State.default)
  })

  it('should check state is correct after first vote', async () => {
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.state = State.voting
    const vote = { house: 'solad', type: 'aye', power: 4 }

    await ackEmit(clients.solad, 'player:vote', vote)

    expect(session.votes.solad).toEqual(vote)
    expect(session.turn).toBe('tork')
    expect(session.leader).toBe('solad')
    expect(session.becomeModAvailable).toBe(true)
    expect(session.state).toBe(State.voting)
  })

  it('does a basic vote round with no ties', async () => {
    session.availablePower = 0
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'aye',
      power: 4,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'aye',
      power: 1,
    })

    expect(session.leader).toBe('solad')
    expect(session.moderator).toBe('crann')
    expect(session.state).toBe(State.voteOver)
    expect(session.availablePower).toBe(8)
    expect(session.winner).toBe('aye')
    expect(session.votes.crann).toEqual({
      house: 'crann',
      type: 'aye',
      power: 1,
    })
    expect(session.turn).toBe('coden')
    expect(session.players.solad.power).toBe(4)
  })

  it('does a vote round where everybody passes but one', async () => {
    session.availablePower = 6
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'aye',
      power: 1,
    })

    expect(session.leader).toBe('coden')
    expect(session.moderator).toBe('crann')
    expect(session.state).toBe(State.voteOver)
    expect(session.winner).toBe('aye')
    expect(session.votes.crann).toEqual({
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    expect(session.turn).toBe('coden')
    expect(session.players.solad.power).toBe(9)
    expect(session.availablePower).toBe(3)
  })

  it('does a vote round where everybody passes, mod breaks tie and becomes leader', async () => {
    session.availablePower = 6
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'gather',
      power: 0,
    })

    expect(session.voteTie).toBe(true)
    expect(session.winner).toBe('')
    await ackEmit(clients.crann, 'player:breakTie', 'aye')

    expect(session.winner).toBe('aye')
    expect(session.leader).toBe('crann')
    expect(session.moderator).toBe('crann')
    expect(session.availablePower).toBe(1)
    expect(session.players.coden.power).toBe(9)
  })

  it('does a vote round with tie, leader on winning side already', async () => {
    session.availablePower = 6
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'aye',
      power: 3,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'nay',
      power: 3,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'nay',
      power: 1,
    })

    expect(session.voteTie).toBe(true)
    expect(session.winner).toBe('')
    await ackEmit(clients.crann, 'player:breakTie', 'aye')

    expect(session.winner).toBe('aye')
    expect(session.leader).toBe('solad')
    expect(session.moderator).toBe('crann')
    expect(session.availablePower).toBe(4)
    expect(session.players.coden.power).toBe(8)
    expect(session.players.solad.power).toBe(5)
    expect(session.winner).toBe('aye')
    expect(session.state).toBe(State.voteOver)
  })

  it('should skip the turns of those who passed', async () => {
    session.availablePower = 6
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'
    session.votes = {
      tork: { house: 'tork', type: 'gather', power: 0 },
      crann: { house: 'crann', type: 'gather', power: 0 },
      tiryll: { house: 'tiryll', type: 'gather', power: 0 },
    }

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'aye',
      power: 3,
    })

    expect(session.winner).toBe('')
    expect(session.leader).toBe('solad')
    expect(session.moderator).toBe('crann')
    expect(session.availablePower).toBe(6)
    expect(session.state).toBe(State.voting)
    expect(session.turn).toBe('coden')
  })

  it('should skip the turns of those who passed and end the round', async () => {
    session.availablePower = 6
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'
    session.votes = {
      tork: { house: 'tork', type: 'gather', power: 0 },
      crann: { house: 'crann', type: 'gather', power: 0 },
      tiryll: { house: 'tiryll', type: 'gather', power: 0 },
      coden: { house: 'coden', type: 'gather', power: 0 },
    }

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'aye',
      power: 3,
    })

    expect(session.winner).toBe('aye')
    expect(session.leader).toBe('solad')
    expect(session.moderator).toBe('crann')
    expect(session.availablePower).toBe(5)
    expect(session.state).toBe(State.voteOver)
    expect(session.players.solad.power).toBe(5)
    expect(session.players.tork.power).toBe(9)
  })

  it('should resolve all the ties', async () => {
    session.availablePower = 3
    session.leader = 'solad'
    session.moderator = 'crann'
    session.state = State.voting
    session.turnOrder = ['solad', 'tork', 'crann', 'tiryll', 'coden']
    session.turn = 'solad'

    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'aye',
      power: 3,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'aye',
      power: 3,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'nay',
      power: 3,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'nay',
      power: 3,
    })

    expect(session.winner).toBe('')
    expect(session.voteTie).toBe(true)

    await ackEmit(clients.crann, 'player:breakTie', 'nay')

    expect(session.winner).toBe('nay')
    expect(session.voteTie).toBe(false)
    expect(session.leaderTie).toBe(true)
    expect(session.leaderChoice).toEqual(
      expect.arrayContaining(['coden', 'tiryll']),
    )
    expect(session.leaderChoice).toHaveLength(2)

    await ackEmit(clients.crann, 'player:breakLeaderTie', 'coden')

    expect(session.leader).toBe('coden')
    expect(session.moderator).toBe('crann')
    expect(session.availablePower).toBe(6)
    expect(session.state).toBe(State.voteOver)
    expect(session.players.solad.power).toBe(8)
    expect(session.players.coden.power).toBe(5)
    expect(session.winner).toBe('nay')
  })

  it('should not end vote early when new leader', async () => {
    session.availablePower = 3
    session.leader = 'tork'
    session.moderator = 'tork'
    session.state = State.voting
    session.turnOrder = ['tork', 'crann', 'tiryll', 'coden', 'solad']
    session.turn = 'tork'

    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.crann, 'player:vote', {
      house: 'crann',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.coden, 'player:vote', {
      house: 'coden',
      type: 'nay',
      power: 3,
    })
    await ackEmit(clients.solad, 'player:vote', {
      house: 'solad',
      type: 'gather',
      power: 0,
    })
    await ackEmit(clients.tork, 'player:vote', {
      house: 'tork',
      type: 'aye',
      power: 1,
    })
    await ackEmit(clients.tiryll, 'player:vote', {
      house: 'tiryll',
      type: 'aye',
      power: 3,
    })

    expect(session.state).toBe(State.voting)
    expect(session.leader).toBe('tiryll')
    expect(session.turn).toBe('coden')
  })
})
