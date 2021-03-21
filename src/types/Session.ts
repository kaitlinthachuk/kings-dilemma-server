import { Player } from './Player'
import { SecretAgenda } from './SecretAgenda'
import secretAgendasData from '../data/secretAgendas.json'
import { VotingManager } from './VotingManager'
import { Outcome } from './Outcome'
import { AgendaToken } from './AgendaToken'
import { Vote } from './Vote'
import * as utils from '../utils'

enum State {
  default,
  secretAgenda,
  voting,
  voteOver,
  gameOver,
  lobby,
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
  //everything below this is needed for voting only TODO potentially refactor this?
  votes: Record<string, Vote> // key: house
  availablePower: number
  ayeOutcomes: Outcome[]
  nayOutcomes: Outcome[]
  leaderTie: boolean
  voteTie: boolean
  winner: string
  leaderChoice: string[]
  //votingManager: VotingManager

  constructor(roomId: string) {
    this.roomId = roomId
    this.state = State.lobby
    // @ts-ignore
    this.players = players.reduce((acc, curr) => (acc[curr.name] = curr), {})

    players.sort((a, b) => {
      if (a.prestige === b.prestige) {
        return a.houseNumber - b.houseNumber
      }
      else {
        return a.prestige - b.prestige
      }
    }) //asc
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
    this.votes = {}
    this.availablePower = 3
    this.ayeOutcomes = []
    this.nayOutcomes = []
    this.leaderTie = false
    this.voteTie = false
    this.winner = ""
    this.leaderChoice = []
  }

  getState() {
    return {
      roomId: this.roomId,
      turn: this.turn,
      leader: this.leader,
      moderator: this.moderator,
      state: this.state,
      secretAgendas: this.secretAgendas,
      players: this.players, //needed for agenda tokens and displaying the other houses in the UI
      turnOrder: this.turnOrder, //needed by sidebar in UI 
      availablePower: this.availablePower,
      votes: this.votes,
      ayeOutcomes: this.ayeOutcomes,
      nayOutcomes: this.nayOutcomes,
      leaderTie: this.leaderTie,
      leaderChoice: this.leaderChoice,
      voteTie: this.voteTie,
      winner: this.winner
    }
  }

  setOutcomes(ayeOutcomes: Outcome[], nayOutcomes: Outcome[]) {
    this.ayeOutcomes = ayeOutcomes
    this.nayOutcomes = nayOutcomes
    this.startVoting()
  }

  setAgendaTokens(assignents: { house: string, tokens: AgendaToken[] }[]) {
    assignents.forEach((val) => {
      this.players[val.house].agendaTokens = val.tokens
    })
  }

  updateSecretAgenda(secretAgendaName: string, house: string) {
    const agendaIndex = this.secretAgendas.findIndex(
      (element) => element.name === secretAgendaName,
    )
    let chosenAgenda = this.secretAgendas.splice(agendaIndex, 1)
    this.players[house].secretAgenda = chosenAgenda[0]
    if (this.secretAgendas.length === 0) {
      this.state = State.default
    } else {
      this.turn = this.whoIsNext(house)
    }
  }

  startVoting() {
    const turnOrderCopy = this.turnOrder.filter(
      (turnOrder) => turnOrder !== this.leader,
    )
    const shuffled = utils.shuffleArray(turnOrderCopy)
    this.turnOrder = [this.leader, ...shuffled]
    this.state = State.voting
    this.turn = this.turnOrder[0]
    this.votes = {}
    this.leaderTie = false
    this.voteTie = false
    this.winner = ""
    this.leaderChoice = []
  }

  updateVote(vote: Vote) {
    if (this.votes[vote.house]) {
      this.votes[vote.house].power += vote.power
    } else {
      this.votes[vote.house] = vote
    }

    if (vote.power > this.maxPowerCommitted(this.votes)) {
      this.leader = vote.house
    } else {
      this.checkIfVotingEnd(vote.house)
    }
  }

  breakTie(winner: string) {
    const votes = this.seperateVotes()
    this.winner = winner
    let winnerVotes = votes[this.winner]
    this.voteTie = false

    if (this.checkForLeaderTie(winnerVotes)) { return }
    this.distriutePower(votes['gather'])
    this.takePowerFromWinners(votes[this.winner])
  }

  breakLeaderTie(winner: string) {
    const votes = this.seperateVotes()
    this.leaderTie = false
    this.leaderChoice = []
    this.leader = winner

    this.distriutePower(votes['gather'])
    this.takePowerFromWinners(votes[this.winner])
  }

  gameOver() {
    this.state = State.gameOver
    //have UI do coin and power sorting?
  }

  private whoIsNext(house: string) {
    let index = this.turnOrder?.indexOf(house)

    index = index === this.turnOrder?.length - 1 ? 0 : index + 1

    return this.turnOrder[index]
  }

  private checkIfVotingEnd(house: string) {
    let nextHouse = this.whoIsNext(house)

    if (nextHouse === this.leader) {
      this.state = State.voteOver
      this.processVoting()
    } else {
      this.turn = house
    }
  }

  private maxPowerCommitted(votes: Record<string, Vote>) {
    let maxPower = 0
    for (let house in votes) {
      if (votes[house].power > maxPower) {
        maxPower = votes[house].power
      }
    }
    return maxPower
  }

  private seperateVotes() {
    let ayeVotes: Vote[] = [],
      nayVotes: Vote[] = [],
      gatherVotes: Vote[] = []

    for (let house in this.votes) {
      switch (this.votes[house].type) {
        case 'aye':
          ayeVotes.push(this.votes[house])
        case 'nay':
          nayVotes.push(this.votes[house])
        case 'gather':
          gatherVotes.push(this.votes[house])
        default:
          console.log("Became mod!")
      }
    }
    const returnObj: Record<string, Vote[]> = { 'aye': ayeVotes, 'nay': nayVotes, 'gather': gatherVotes }
    return returnObj

  }

  private countPower(votes: Vote[]) {
    let power = 0
    votes.forEach(vote => {
      power += vote.power
    })
    return power
  }

  private processVoting() {
    const votes = this.seperateVotes(),
      ayePower = this.countPower(votes['aye']),
      nayPower = this.countPower(votes['nay'])

    //see if there is a tie
    if (ayePower === nayPower) {
      //ask mod to break tie -> return
      this.voteTie = true
      return
    }

    this.winner = ayePower > nayPower ? 'aye' : 'nay'
    let winnerVotes = votes[this.winner]

    if (this.checkForLeaderTie(winnerVotes)) { return }
    this.distriutePower(votes['gather'])
    this.takePowerFromWinners(votes[this.winner])
  }

  private checkForLeaderTie(votes: Vote[]) {
    //if no tie then check if leader is on the winning side
    if (this.votes[this.leader].type !== this.winner) {
      //if no pick new leader, if tie get mod to break it -> return
      let potentialLeaders = this.getLeaders(votes)
      if (potentialLeaders.length > 1) {
        this.leaderTie = true
        this.leaderChoice = potentialLeaders
        return true
      } else {
        this.leader = potentialLeaders[0]
        return false
      }
    }
  }

  private distriutePower(votes: Vote[]) {
    if (votes.length === 0) {
      return
    }

    let powerPer = Math.floor(this.availablePower / votes.length)

    votes.forEach(vote => {
      this.players[vote.house].power += powerPer
      this.availablePower -= powerPer
    })
  }

  private getLeaders(votes: Vote[]) {
    votes.sort((a, b) => {
      return b.power - a.power //desc
    })

    let leaders = votes.filter((vote, index, array) => {
      return vote.power === array[0].power
    }).map(vote => {
      return vote.house
    })

    return leaders
  }

  private takePowerFromWinners(votes: Vote[]) {
    votes.forEach(vote => {
      this.players[vote.house].power -= vote.power
      this.availablePower += vote.power
    })
  }
}
