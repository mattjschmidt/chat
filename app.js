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
var typingUsers = [];
io.on('connection', function(socket){
  socket.on('chat message', function(username, msg){
    function getDateTime() {
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

      return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
   }
    io.emit('chat message', username, msg, getDateTime());
    console.log(username + ": " + msg + " (" + getDateTime() + ")")
  });
  socket.on('typing', function(username){
    typingUsers.push(username);
    if(typingUsers.length < 2){
      io.emit('typing', typingUsers.toString() + ' is typing...');
    }
    else{
      io.emit('typing', typingUsers.toString() + ' are typing...');
    }
  });
  function remove(array, element) {
    return array.filter(e => e !== element);
  }
  socket.on('doneTyping', function(username){
    typingUsers = remove(typingUsers, username);
    io.emit('doneTyping', typingUsers.toString());
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
