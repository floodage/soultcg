const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000

const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,"public")));


server.listen(PORT, () => console.log("server running on port " +  PORT));


const connections = [null, null]

io.on('connection', socket => {
  // console.log('New WS Connection')

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // Tell the connecting client what player number they are
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  // Ignore player 3
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // Tell eveyone what player number just connected
  socket.broadcast.emit('player-connection', playerIndex)

  // Handle Diconnect
  socket.on('disconnect', () => {
    console.log(`Player ${playerIndex} disconnected`)
    connections[playerIndex] = null
    //Tell everyone what player numbe just disconnected
    socket.broadcast.emit('player-connection', playerIndex)
  })

  socket.on("push", data => { 
    socket.broadcast.emit('push', data);
  })
  socket.on("pull", data => { 
    socket.broadcast.emit('pull', data);
  })
  socket.on("deck", data => { 
    socket.broadcast.emit('deck', data);
  })
  socket.on("discard", data => { 
    socket.broadcast.emit('discard', data);
  })
  socket.on("point", data => { 
    socket.broadcast.emit('point', data);
  })
  socket.on("damage", data => { 
    socket.broadcast.emit('damage', data );
  })
})

