const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,userLeave,getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
//run when client connects
io.on('connection',socket=>{
  const botName = 'chatcord bot';
  //broadcast the joined msg
  socket.on('joinRoom',({room,username})=>{
    const user = userJoin(socket.id,username,room);
    socket.join(user.room);
    //welcome to current user
    socket.emit('message',formatMessage(botName,'welcome yoo'));
    //send joined message to every user in the chat except ourselves
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${username} has joined the room`));
    //send to all clients( in room ) including the sender
    io.to(user.room).emit('roomUsers',{
      room:user.room,
      users:getRoomUsers(user.room)
      }
    )
    //recieving messages from user
    socket.on('chat-message',(msg)=>{
      //sending the msg to all users in the room
      io.to(user.room).emit('chat-message',formatMessage(user.username,msg))
    })

    //when user leaves the room
    socket.on('disconnect',()=>{
      //remove the user from users array in users.js
      const leftUser = userLeave(socket.id);
      //send left message to every user in the chat except ourselves
      socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${leftUser.username} has left the room`));
      io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
        }
      )
  })
 })
})
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
