import { io, Socket } from 'socket.io-client'
import initServer from '../src/server'
import { Server as HTTPServer } from 'http'
import { Session } from '../src/types/Session'

describe('Gameplay tests', () => {
  let server: HTTPServer
  let clients: Record<string, Socket>
  let session = Session.getInstance()

  const createClient = (port: string): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const socket = io(`http://localhost:${port}`)
      socket.on('connect', () => resolve(socket))
      setTimeout(() => {
        reject(new Error('failed to connect :('))
      }, 5000)
    })
  }

  const ackEmit = async (
    socket: Socket,
    event: string,
    ...args: string[]
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      socket.on('game:state', () => resolve())
      socket.emit(event, ...args)
    })
  }

  beforeAll(async (done) => {
    server = initServer()
    server.listen(async () => {
      const players = ['Tork', 'Solad', 'Crann', 'Coden', 'Tiryll']
      // @ts-ignore
      const port = server.address().port
      const sockets = await Promise.all(players.map(() => createClient(port)))
      clients = Object.fromEntries(
        players.map((_, i) => [players[i], sockets[i]]),
      )

      done()
    })
  })

  beforeEach(() => {
    session.resetState()
    session.addPlayer('tork')
    session.addPlayer('solad')
    session.addPlayer('crann')
    session.addPlayer('coden')
    session.addPlayer('tiryll')
    session.startGame()
    session.updateSecretAgenda(session.secretAgendas[0].name, 'tork')
    session.updateSecretAgenda(session.secretAgendas[0].name, 'solad')
    session.updateSecretAgenda(session.secretAgendas[0].name, 'crann')
    session.updateSecretAgenda(session.secretAgendas[0].name, 'coden')
    session.updateSecretAgenda(session.secretAgendas[0].name, 'tiryll')
  })

  afterAll((done) => {
    Object.values(clients).forEach((client) => client.close())
    server.close(done)
  })

  fit('has all the players', () => {
    expect(Object.keys(session.players)).toHaveLength(5)
    expect(session.state).toBe('default')
  })

  it('basicTurnTest', () => {
    // power in middle 0
    // leader is solad
    // moderator is crann
    // availablePower is 3
    // state VOTING
    // turn solad
    // turnOrder solad, tork, crann, tiryll, coden
    //solad vote aye 3
    //verify turn is now tork
  })

  it('basic', () => {
    // power in middle 0
    // leader is solad
    // moderator is crann
    // availablePower is 3
    // state VOTING
    // turn solad
    // turnOrder solad, tork, crann, tiryll, coden
    // solad vote aye 3
    // tork vote aye 1
    // crann vote aye 1
    // tiryll vote aye 1
    // coden vote aye 1
    // aye win
    // power in middle 7
    // leader is solad
    // mod is crann
    // state VOTINGOVER
    // turn is null
  })

  it('should resolve all the ties', () => {
    // leader is solad
    // moderator is crann
    // availablePower is 3
    // state VOTING
    // turn solad
    // turnOrder solad, tork, crann, tiryll, coden

    clients.solad.emit('player:vote', 'aye', 2) // aye 2 power
    clients.tork.emit('player:vote', 'nay', 1) // nay 1 power
    clients.crann.emit('player:vote', 'nay', 1)
    clients.tiryll.emit('player:vote', 'gather') // pass and gather power
    clients.coden.emit('player:vote', 'mod') // pass and become moderator

    // round ends because solad is leader
    // who wins round tie
    // coden (mod) chooses nay to be winning side
    // now there is tie for leader because leader has to be on winning side
    // coden (mod) chooses between tork and crann (tork)
    // assert that:
    //   tork is leader
    //   coden is mod
    //   nay should won
    //   tiryll power should be + 3
    //   middle has has 2 power
    //   tork power -1
    //   crann power -1
    //   tiryll coin + 1
    //   coden coin + 1
    //   turn is null
    //   state VOTINGOVER
  })
})
