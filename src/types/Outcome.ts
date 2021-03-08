import {Resource} from './Resource'

export interface Outcome {
  type: 'pos' | 'neg',
  resource: Resource,
}
