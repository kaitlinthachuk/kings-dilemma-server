export interface Vote {
  house: string
  type: 'aye' | 'nay' | 'gather' | 'mod'
  power: number
}
