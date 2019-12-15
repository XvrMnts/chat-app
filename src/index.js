const app = require('./app')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT

const server = http.createServer(app)
const io = socketio(server)

let count = 0

io.on('connection', (socket) => {
    console.log('New socket connection')

    //socket.emit('message',"Welcome. The count is "+count)

    socket.on('increment',()=>{
        count++
        /* 
        // emit to a particular connection
        socket.emit('countUpdated',count) */
        // emit to all connections
        io.emit('message',"The count is "+count)
    })

    socket.on('join', ({username, room},callback) => {

        const { error, user } = addUser({id: socket.id, username, room})

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('broadcastMessage', generateMessage('Admin',`Welcome!. The count is ${count}`))
        socket.broadcast.to(user.room).emit('broadcastMessage',generateMessage('Admin',`${user.username}  has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    
    })

    socket.on('sendMessage',(message,callback)=>{

        const user = getUser(socket.id)

        const filter =  new Filter()

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }

        /* 
        // emit to a particular connection
        socket.emit('countUpdated',count) */

        // emit to all connections
        console.log("message received: "+message)
        io.to(user.room).emit('broadcastMessage',generateMessage(user.username,message))
        callback()
    })

    socket.on('disconnect',() => {
        const user = removeUser(socket.id)

        if (user) {
           io.to(user.room).emit('broadcastMessage',generateMessage('Admin',`${user.username}  has left`))

           io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
            })
         }
    })

    socket.on('sendLocation',(location,callback) => {

        const user = getUser(socket.id)

        //io.emit('message','Location: '+JSON.stringify(location))
        //io.emit('message',`https://google.com/maps?q=${location.latitude},${location.longitude}`)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

})

server.listen(port,() => {
    console.log('Server is up on port ',port)
})