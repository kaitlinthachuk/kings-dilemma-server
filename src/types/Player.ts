import { AgendaToken } from './AgendaToken'
import { SecretAgenda } from './SecretAgenda'
import houseData from '../data/houses.json'

export class Player {
  house: string // id
  prestige: number
  crave: number
  coins: number
  power: number
  agendaTokens: AgendaToken[]
  secretAgenda: SecretAgenda | null
  houseNumber: number

  constructor(house: string, prestige: number, crave: number) {
    this.house = house
    this.prestige = prestige
    this.crave = crave
    this.coins = 10
    this.power = 8
    this.agendaTokens = []
    this.secretAgenda = null
    this.houseNumber = (houseData as any)[house].houseNumber
  }
}
