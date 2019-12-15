const app = require('./app')
const http = require('http')
const socketio = require('socket.io')

const port = process.env.PORT

const server = http.createServer(app)
const io = socketio(server)

let count = 0

io.on('connection', (socket) => {
    console.log('New socket connection')
    socket.emit('countUpdated',count)

    socket.on('increment',()=>{
        count++
        /* 
        // emit to a particular connection
        socket.emit('countUpdated',count) */
        // emit to all connections
        io.emit('countUpdated',count)
    })

})

server.listen(port,() => {
    console.log('Server is up on port ',port)
})