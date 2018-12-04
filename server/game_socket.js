const SocketIO = require('socket.io')

const games = {}

module.exports = function(server) {
  const io = SocketIO(server)

  io.on('connection', socket => {
    const { gameId, role } = socket.handshake.query
    console.log('connected', socket.handshake.query)
    switch (role) {
      case 'gamemaster':
        games[gameId] = {
          socketId: socket.id,
          players: {},
        }
        socket.on('start round', () => {
          console.log('start round')
          io.to(gameId).emit('round start')
        })
        break;
      case 'player':
        const game = games[gameId]
        if (game) {
          socket.join(gameId) // join game room

          const { playerId } = socket.handshake.query
          const { socketId, players } = game
          players[playerId] = { connected: true }
          socket.on('disconnect', reason => {
            console.log('disconnected', playerId)
            players[playerId].connected = false
            io.to(socketId).emit('players', players)
          })
          io.to(socketId).emit('players', players)
        }
        break;
    }
  })

  return io
}
