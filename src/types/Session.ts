import { Player } from './Player'
import { SecretAgenda } from './SecretAgenda'
import secretAgendasData from '../data/secretAgendas.json'
import { VotingManager } from './VotingManager'

enum State {
  default,
  secretAgenda,
  voting,
  voteOver,
  gameOver,
}

export class Session {
  roomId: string // session id
  players: Record<string, Player>
  turn: string
  turnOrder: string[]
  leader: string
  moderator: string
  state: State
  secretAgendas: SecretAgenda[]
  votingManager: VotingManager

  constructor(roomId: string, players: Player[]) {
    this.roomId = roomId
    this.votingManager = new VotingManager()
    // @ts-ignore
    this.players = players.reduce((acc, curr) => (acc[curr.name] = curr), {})

    players.sort((a, b) => a.prestige - b.prestige) //asc
    this.leader = players[players.length - 1].house
    this.moderator = players[0].house
    this.turnOrder = players.map((player) => player.house)
    this.turn = this.moderator

    // randomly remove one secret agenda
    secretAgendasData.splice(
      Math.floor(Math.random() * secretAgendasData.length - 1),
      1,
    )
    this.secretAgendas = secretAgendasData
    this.state = State.secretAgenda
  }

  getState() {
    return {
      roomId: this.roomId,
      turn: this.turn,
      leader: this.leader,
      moderator: this.moderator,
      state: this.state,
      secretAgendas: this.secretAgendas,
      voteState: this.votingManager.getVoteState(),
    }
  }

  updateSecretAgenda(agenda: SecretAgenda, house: string) {
    const agendaIndex = this.secretAgendas.findIndex(
      (element) => element.name === agenda.name,
    )
    this.secretAgendas.splice(agendaIndex, 1)
    this.players[house].secretAgenda = agenda
    this.nextTurn(this.whoIsNext(house))
  }

  private checkIfVotingEnd(house: string) {
    let nextHouse = this.whoIsNext(house)

    if (nextHouse === this.leader) {
      this.state = State.voteOver
    } else {
      this.nextTurn(house)
    }
  }

  private nextTurn(house: string) {
    this.turn = house
    // Socket.emit("turn", house)
  }

  private whoIsNext(house: string) {
    let index = this.turnOrder?.indexOf(house)

    index = index === this.turnOrder?.length - 1 ? 0 : index + 1

    return this.turnOrder[index]
  }
}
