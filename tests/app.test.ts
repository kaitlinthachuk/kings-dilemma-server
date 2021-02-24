import { agent as request } from 'supertest'
import app from '../src/app'

describe('App tests', () => {
  it('/ returns 200', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
  })
})
