export interface SecretAgenda {
  name: string
  resourceGoalDiagram: string // link to diagram image
  resourceGoalScoring: {
    numResources: number
    points: number
  }[]
  moneyGoalScoring: {
    rank: string
    points: number
  }[]
  extra: string
}
