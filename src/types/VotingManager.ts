import {Outcome} from './Outcome'
import {Vote} from './Vote'
import * as utils from '../utils'

export class VotingManager {
  votes: Record<string, Vote> // key: house
  availablePower: number
  ayeOutcomes: Outcome[]
  nayOutcomes: Outcome[]

  constructor() {
    this.votes = {}
    this.availablePower = 3
    this.ayeOutcomes = []
    this.nayOutcomes = []
  }

  startVoting(turnOrder, leader) {
    // this.state = State.voting
    const turnOrderCopy = this.turnOrder.filter(
      (turnOrder) => turnOrder !== this.leader,
    )
    const shuffled = utils.shuffleArray(turnOrderCopy)
    this.turnOrder = [this.leader, ...shuffled]
  }

  updateVote(vote: Vote) {
    if (this.votes[vote.house]) {
      this.votes[vote.house].power += vote.power
    } else {
      this.votes[vote.house] = vote
    }
    this.checkIfVotingEnd(vote.house)
  }


  getVoteState() {
    return {
      votes: this.votes,
      availablePower: this.availablePower,
      ayeOutcomes: this.ayeOutcomes,
      nayOutcomes: this.nayOutcomes,
    }
  }

}