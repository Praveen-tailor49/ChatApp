const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')


app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSoket connection');

    socket.emit('message', {
        text: 'Welcome',
        createAt: new Date().getTime()
    })
    socket.broadcast.emit('message', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {
        const fillter = new Filter()

        if(fillter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback('Location Deliverd')
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'user left')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})