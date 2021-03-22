import { Session } from './Session'
import { Player } from './Player'

export class SessionManager {
  private static instance: SessionManager
  private sessions: Record<string, Session>

  private constructor() {
    this.sessions = {0: new Session('0')}
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }

    return SessionManager.instance
  }

  createSession(id: string): string {
    this.sessions[id] = new Session(id)
    return id
  }

  getSession(id: string) {
    return this.sessions[id]
  }
}
