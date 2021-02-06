
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const socket = io();
let URL = window.location.href;
//getting username and roomname from URL
let username = URL.split('=')[1].split('&')[0];
let room = URL.split('=')[2];

socket.emit('joinRoom',{room,username});

socket.on('message',(message)=>{
  outputMessage(message);
  console.log(message);
})

//recieving info about the users and name of the room
socket.on('roomUsers',(payload)=>{
  outputRoomName(payload.room);
  outputUsers(payload.users);
})

//sending message from the form
chatForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  e.stopPropagation();
  let message = document.querySelector('#msg');
  if(message.value){
    socket.emit('chat-message',message.value);
    message.value = '';
  }
  else{
    alert('plase type in something');
  }
})

//outputing the messages that we are reciving from form
socket.on('chat-message',(payload)=>{
  outputMessage(payload);
})

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerHTML = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
  roomName.innerText = room;
}

function outputUsers(users){
  userList.innerHTML = '';
  users.forEach((u)=>{
    const p = document.createElement('h4');
    p.innerText = u.username;
    userList.appendChild(p);
  })
}