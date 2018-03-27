var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
const router = express.Router();
var port = process.env.PORT || 3000;

app.set("view engine", "pug");
app.use(require('./routes'));

app.use('/styling', express.static(__dirname + '/styling'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

router.get("/", (req, res) => {
    res.render("chat");
});

var onlineUsers = [];
var typingUsers = [];
io.on('connection', function(socket){
  socket.on('confirm username', function(username){
    var nameFound = false;
    for(i = 0; i < onlineUsers.length; i++) {
      if (username == onlineUsers[i].username){
        nameFound = true;
      }
    }
    if (nameFound == false) {
      socket.username = username;
      onlineUsers.push(socket);
      console.log(socket.username + " has connected.");
      io.emit('user connected', socket.username);
    }
    socket.emit('response', nameFound);
  });
  socket.on('chat message', function(chatObj){
    var time = getDateTime();
    chatObj.username = socket.username;
    chatObj.time = time;
    chatObj.id = socket.id;
    io.emit('chat message', chatObj);
    console.log("(" + chatObj.time.string + ") " + chatObj.username + ": " + chatObj.message)
  });
  socket.on('typing', function(){
    typingUsers.push(socket.username);
    socket.broadcast.emit('typing', typingUsers);
  });
  function remove(array, element) {
    return array.filter(e => e !== element);
  }
  socket.on('done typing', function(){
    typingUsers = remove(typingUsers, socket.username);
    io.emit('done typing', typingUsers);
  });
  socket.on('disconnect', function(){
    if (socket.username != null) {
      var i = onlineUsers.indexOf(socket);
      onlineUsers.splice(i,1);
      console.log(socket.username + " has disconnected.")
      io.emit('user disconnected', socket.username)
    }
  });
});

function getDateTime() {
      var dateTime = new Object();
      var date = new Date();
      var hour = date.getHours();
      hour = (hour < 10 ? "0" : "") + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? "0" : "") + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? "0" : "") + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? "0" : "") + month;

      var day  = date.getDate();
      day = (day < 10 ? "0" : "") + day;


      dateTime.year = year;
      dateTime.month = month;
      dateTime.day = day;
      dateTime.dayOfWeek = new Date().toLocaleString('en-us', {  weekday: 'long' });
      dateTime.hour = hour;
      dateTime.min = min;
      dateTime.sec = sec;
      dateTime.string = year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
      return dateTime;
}

http.listen(port, function(){
  console.log('listening on *:' + port);
});
