import { Session } from './Session'
import { Player } from './Player'

export class SessionManager {
  private static instance: SessionManager
  private sessions: Record<string, Session>

  private constructor() {
    this.sessions = {}
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }

    return SessionManager.instance
  }

  createSession(players: Player[]): string {
    // hardcode id of 0 because we will only have one session for now
    const id = 'room-0'
    this.sessions[id] = new Session(id, players)
    return id
  }

  getSession(id: string) {
    return this.sessions[id]
  }
}
