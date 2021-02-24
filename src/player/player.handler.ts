type Vote = 'aye' | 'nay'

export const vote = (player: string, type: Vote, numPower: number) => {
  console.log(`voted ${type} with ${numPower}`)
}
