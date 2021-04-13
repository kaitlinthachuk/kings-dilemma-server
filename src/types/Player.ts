import { AgendaToken } from './AgendaToken'
import { SecretAgenda } from './SecretAgenda'
import houseData from '../data/houses.json'

export class Player {
  house: string // id
  coins: number
  power: number
  agendaTokens: AgendaToken[]
  secretAgenda: SecretAgenda | null
  prestige: number
  crave: number
  houseNumber: number
  isLeader: boolean
  isModerator: boolean

  constructor(house: string) {
    this.house = house
    this.coins = 10
    this.power = 8
    this.agendaTokens = []
    this.secretAgenda = null
    this.prestige = NaN
    this.crave = NaN
    this.houseNumber = (houseData as any)[house].houseNumber
    this.isLeader = false
    this.isModerator = false
  }
}
