import { AgendaToken } from './AgendaToken'
import { SecretAgenda } from './SecretAgenda'
import houseData from '../data/houses.json'

export class Player {
  house: string // id
  name: string
  coins: number
  power: number
  agendaTokens: AgendaToken[]
  secretAgenda: SecretAgenda | null
  prestige: number
  crave: number
  houseNumber: number

  constructor(house: string, name: string) {
    this.house = house
    this.name = name
    this.coins = 10
    this.power = 8
    this.agendaTokens = []
    this.secretAgenda = null
    this.prestige = 0
    this.crave = 0
    this.houseNumber = (houseData as any)[house].houseNumber
  }
}
