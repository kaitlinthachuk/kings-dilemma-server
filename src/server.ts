import http from 'http'
import app from './app'

const PORT = process.env.PORT || 8080

http.createServer(app).listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`)
})
