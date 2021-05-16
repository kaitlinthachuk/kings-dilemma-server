import { Player } from './Player'
import { SecretAgenda } from './SecretAgenda'
import secretAgendasData from '../data/secretAgendas.json'
import { Outcome } from './Outcome'
import { AgendaToken } from './AgendaToken'
import { Vote } from './Vote'
import { State } from './State'
import * as utils from '../utils'

export class Session {
  private static instance: Session

  players: Record<string, Player>
  state: State
  secretAgendas: SecretAgenda[]
  turn: string
  turnOrder: string[]
  leader: string
  moderator: string
  //everything below this is needed for voting only TODO potentially refactor this?
  votes: Record<string, Vote> // key: house
  availablePower: number
  ayeOutcomes: Outcome[]
  nayOutcomes: Outcome[]
  leaderTie: boolean
  voteTie: boolean
  winner: string
  leaderChoice: string[]
  becomeModAvailable: boolean
  votingCardUrl: string
  chronicleStickersUrl: string
  message: string

  private constructor() {
    this.players = {}
    this.state = State.lobby

    // randomly remove 1 secret agenda
    const randIndex = Math.floor(Math.random() * secretAgendasData.length - 1)
    this.secretAgendas = [
      ...secretAgendasData.slice(0, randIndex),
      ...secretAgendasData.slice(randIndex + 1),
    ]
    this.turn = ''
    this.turnOrder = []
    this.leader = ''
    this.moderator = ''

    this.votes = {}
    this.availablePower = 3
    this.ayeOutcomes = []
    this.nayOutcomes = []
    this.leaderTie = false
    this.voteTie = false
    this.winner = ''
    this.leaderChoice = []
    this.becomeModAvailable = true
    this.votingCardUrl = ''
    this.chronicleStickersUrl = ''
    this.message = 'Welcome!'
  }

  static getInstance(): Session {
    if (!Session.instance) {
      Session.instance = new Session()
    }
    return Session.instance
  }

  resetInstance(): void {
    this.players = {}
    this.state = State.lobby

    // randomly remove 1 secret agenda
    const randIndex = Math.floor(Math.random() * secretAgendasData.length - 1)
    console.log({ randIndex })
    this.secretAgendas = [
      ...secretAgendasData.slice(0, randIndex),
      ...secretAgendasData.slice(randIndex + 1),
    ]
    this.turn = ''
    this.turnOrder = []
    this.leader = ''
    this.moderator = ''

    this.votes = {}
    this.availablePower = 3
    this.ayeOutcomes = []
    this.nayOutcomes = []
    this.leaderTie = false
    this.voteTie = false
    this.winner = ''
    this.leaderChoice = []
    this.becomeModAvailable = true
    this.message = 'Welcome!'
  }

  getState() {
    const gameState = {
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
      winner: this.winner,
      message: this.message,
      chronicleStickersUrl: this.chronicleStickersUrl,
      becomeModAvailable: this.becomeModAvailable,
      votingCardUrl: this.votingCardUrl,
    }
    // console.log(gameState)
    return gameState
  }

  addPlayer(house: string, prestige: number, crave: number) {
    if (!this.players[house]) {
      this.players[house] = new Player(house, prestige, crave)
    }
  }

  startGame() {
    this.state = State.secretAgenda
    const players = Object.values(this.players).sort((a, b) => {
      if (a.prestige === b.prestige) {
        return a.houseNumber - b.houseNumber
      }
      return a.prestige - b.prestige
    })
    this.leader = players[players.length - 1].house
    this.moderator = players[0].house
    this.turnOrder = players.map((player) => player.house)
    this.turn = this.moderator
  }

  endGame() {
    this.state = State.gameOver
  }

  addOutcome(outcome: Outcome) {
    if (outcome.type === 'pos') {
      this.ayeOutcomes.push(outcome)
    } else {
      this.nayOutcomes.push(outcome)
    }
  }

  removeOutcome(outcome: Outcome) {
    if (outcome.type === 'pos') {
      this.ayeOutcomes = this.ayeOutcomes.filter((el) => {
        return el.resource !== outcome.resource
      })
    } else {
      this.nayOutcomes = this.nayOutcomes.filter((el) => {
        return el.resource !== outcome.resource
      })
    }
  }

  setAgendaToken(house: string, token: AgendaToken) {
    this.players[house].agendaTokens.push(token)
  }

  removeAgendaToken(house: string, token: AgendaToken) {
    console.log(token)
    this.players[house].agendaTokens = this.players[house].agendaTokens.filter(
      (agenda) => {
        return !(
          agenda.type === token.type && agenda.resource === token.resource
        )
      },
    )
  }

  updateSecretAgenda(house: string, secretAgendaName: string) {
    const agendaIndex = this.secretAgendas.findIndex(
      (element) => element.name === secretAgendaName,
    )
    const chosenAgenda = this.secretAgendas.splice(agendaIndex, 1)
    this.players[house].secretAgenda = chosenAgenda[0]
    if (Object.values(this.players).every((player) => player.secretAgenda)) {
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
    this.winner = ''
    this.leaderChoice = []
    this.becomeModAvailable = true
  }

  updateVote(vote: Vote) {
    if (vote.type === 'mod') {
      this.updateModerator(vote.house)
      this.becomeModAvailable = false
      this.players[vote.house].coins += 1
    } else if (vote.type === 'gather') {
      this.players[vote.house].coins += 1
    }

    const currMaxPower = this.maxPowerCommitted(this.votes)

    if (this.votes[vote.house]) {
      this.votes[vote.house].power += vote.power
    } else {
      this.votes[vote.house] = vote
    }

    if (this.votes[vote.house].power > currMaxPower) {
      this.updateLeader(vote.house)
    }

    this.checkIfVotingEnd(vote.house)
  }

  breakTie(winner: string) {
    const votes = this.seperateVotes()
    this.winner = winner
    const winnerVotes = votes[this.winner]
    this.voteTie = false

    if (winnerVotes.length !== 0 && this.checkForLeaderTie(winnerVotes)) {
      return
    }
    this.distributePower(votes.gather)
    this.takePowerFromWinners(votes[winner])
  }

  breakLeaderTie(winner: string) {
    const votes = this.seperateVotes()
    this.leaderTie = false
    this.leaderChoice = []
    this.updateLeader(winner)

    this.distributePower(votes.gather)
    this.takePowerFromWinners(votes[this.winner])
  }

  private whoIsNext(house: string) {
    let index = this.turnOrder?.indexOf(house)

    index = index === this.turnOrder?.length - 1 ? 0 : index + 1

    return this.turnOrder[index]
  }

  private checkIfVotingEnd(house: string) {
    const nextHouse = this.whoIsNext(house)

    if (nextHouse === this.leader) {
      this.state = State.voteOver
      this.processVoting()
    } else if (
      this.votes[nextHouse] &&
      (this.votes[nextHouse].type === 'gather' ||
        this.votes[nextHouse].type === 'mod')
    ) {
      this.checkIfVotingEnd(nextHouse) //TODO check if this is the correct logic for skipping the turns of those who have voted to pass or become mod
    } else {
      this.turn = nextHouse
    }
  }

  private maxPowerCommitted(votes: Record<string, Vote>): number {
    return Math.max(...Object.values(votes).map((vote) => vote.power))
  }

  private seperateVotes() {
    const ayeVotes: Vote[] = []
    const nayVotes: Vote[] = []
    const gatherVotes: Vote[] = []

    for (const house in this.votes) {
      switch (this.votes[house].type) {
        case 'aye':
          ayeVotes.push(this.votes[house])
          break
        case 'nay':
          nayVotes.push(this.votes[house])
          break
        case 'gather':
          gatherVotes.push(this.votes[house])
          break
        default:
          console.log('Became mod!')
      }
    }
    const returnObj: Record<string, Vote[]> = {
      aye: ayeVotes,
      nay: nayVotes,
      gather: gatherVotes,
    }
    return returnObj
  }

  private countPower(votes: Vote[]) {
    let power = 0
    votes.forEach((vote) => {
      power += vote.power
    })
    return power
  }

  private processVoting() {
    const votes = this.seperateVotes(),
      ayePower = this.countPower(votes.aye),
      nayPower = this.countPower(votes.nay)

    //see if there is a tie
    if (ayePower === nayPower) {
      //ask mod to break tie -> return
      this.voteTie = true
      return
    }

    this.winner = ayePower > nayPower ? 'aye' : 'nay'
    const winnerVotes = votes[this.winner]

    if (this.checkForLeaderTie(winnerVotes)) {
      return
    }
    this.distributePower(votes.gather)
    this.takePowerFromWinners(votes[this.winner])
  }

  private checkForLeaderTie(votes: Vote[]) {
    //if no tie then check if leader is on the winning side
    if (this.votes[this.leader].type !== this.winner) {
      //if no pick new leader, if tie get mod to break it -> return
      const potentialLeaders = this.getLeaders(votes)
      if (potentialLeaders.length > 1) {
        this.leaderTie = true
        this.leaderChoice = potentialLeaders
        return true
      } else {
        this.updateLeader(potentialLeaders[0])
        return false
      }
    }
  }

  private distributePower(votes: Vote[]) {
    if (votes.length === 0) {
      return
    } else if (votes.length === 5) {
      this.updateLeader(this.moderator)
    }

    const powerPer = Math.floor(this.availablePower / votes.length)

    votes.forEach((vote) => {
      this.players[vote.house].power += powerPer
      this.availablePower -= powerPer
    })
  }

  private getLeaders(votes: Vote[]) {
    votes.sort((a, b) => {
      return b.power - a.power //desc
    })

    const leaders = votes
      .filter((vote, index, array) => {
        return vote.power === array[0].power
      })
      .map((vote) => {
        return vote.house
      })

    return leaders
  }

  private takePowerFromWinners(votes: Vote[]) {
    votes.forEach((vote) => {
      this.players[vote.house].power -= vote.power
      this.availablePower += vote.power
    })
  }

  private updateLeader(newLeader: string) {
    this.leader = newLeader
  }

  private updateModerator(newModerator: string) {
    this.moderator = newModerator
  }
}
