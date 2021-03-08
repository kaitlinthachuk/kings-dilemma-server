import { Resource } from './Resource'

export interface AgendaToken {
  type: 'pos' | 'neg'
  resource: Resource
}
