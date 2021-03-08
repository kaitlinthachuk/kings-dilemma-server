import { agent as request } from 'supertest'
import { io, Socket } from 'socket.io-client'
import initServer from '../src/server'
import { Server as HTTPServer } from 'http'
import { SessionManager } from '../src/types'

describe('Gameplay tests', () => {
  let server: HTTPServer
  let sessionManager: SessionManager
  let clients: Record<string, Socket[]>

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

  beforeAll(async (done) => {
    server = initServer()
    const players = [
      { house: 'Tork', name: 'Rhinehardt' },
      { house: 'Solad', name: 'Stormcloak' },
    ]
    server.listen(async () => {
      // @ts-ignore
      const port = server.address().port
      clients = await (await Promise.all(players.map(() => createClient(port)))).reduce((acc, curr) => {
        
      }, {})
      console.log('clients: ', clients)
      done()
    })
  })

  afterAll((done) => {
    server.close(done)
  })

  it('test player 0 votes aye', () => {
    console.log(clients)
    clients[0].emit('player:vote')
  })

  it('basicTurnTest', () =>{
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
