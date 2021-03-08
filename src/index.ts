import initServer from './server'

const PORT = process.env.PORT || 3000

const httpServer = initServer()

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`)
})
