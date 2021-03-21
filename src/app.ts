import express, { Request, Response, NextFunction } from 'express'
import { SessionManager } from './types'
import { Player } from './types'
import bodyParser from 'body-parser'
import cors from 'cors'
import houseData from './data/houses.json'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'OK',
    uptime: process.uptime(),
  })
})

app.get('/houses', (req: Request, res: Response) => {
  res.send(houseData)
})

type PlayerReq = { house: string; name: string }
app.post('/sessions', (req: Request, res: Response) => {
  const { players } = req.body
  const newPlayers: Player[] = (players as PlayerReq[]).map(
    ({ house, name }): Player => {
      return new Player(house, name)
    },
  )
  const sessionManager = SessionManager.getInstance()
  const roomId = sessionManager.createSession(newPlayers)
  res.json({ roomId })
})

// (super secret) game master route
app.get('/gm', (req: Request, res: Response) => {
  const sessionManager = SessionManager.getInstance()
  res.json(sessionManager.getSession('0'))
})

// error handling middleware declared last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

export default app
