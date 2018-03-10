var socket = io();
$(function () {
  $('#usernameModal').modal({
    dismissible: false
  });
  $('#usernameModal').modal('open');
  socket.on('response', function(isTaken){
    if(isTaken){
      alert("Taken");
    }
    else{
      $('#usernameModal').modal('close');
    }
  });
  $('form').submit(function(){
    var messageField = document.getElementById('message').value;
    var chatObj = {message: messageField};
    socket.emit('chat message', chatObj);
    $('#message').val('');
    return false;
  });
  socket.on('chat message', function(chatObj){
    play();
    $('#messages').append($('<li style="display: inline-block; padding: 10px; border-radius: 20px; margin-left: 10px; margin-top: 10px; background-color: #E4E3E9; word-wrap: break-word; max-width: 70%; width: auto;">').text("(" + chatObj.time + ") " + chatObj.username + ": " + chatObj.message));
    window.scrollTo(0, document.body.scrollHeight);
  });
  socket.on('typing', function(usersTyping){
    document.getElementById('typingArea').style.display='block';
    window.scrollTo(0, document.body.scrollHeight);
  });
  socket.on('done typing', function(usersTyping){
    document.getElementById('typingArea').style.display='none';
  });
  socket.on('user connected', function(username){
    $('#messages').append($('<li style="text-align: center;">').text(username + " has joined the chat."));
  });
  socket.on('user disconnected', function(username){
    $('#messages').append($('<li style="text-align: center;">').text(username + " has left."));
  });
});

function play() {
  var audio = document.getElementById("audio");
  audio.play();
}

var typing = false;
var timeout = undefined;

function timeoutFunction(){
  typing = false;
  socket.emit('done typing');
}

function currentlyTyping(){
  if(typing == false) {
    typing = true;
    socket.emit('typing');
    timeout = setTimeout(timeoutFunction, 1500);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 1500);
  }
}

function confirmUsername() {
  var usernameField = document.getElementById('username').value;
  socket.emit('confirm username', usernameField);
}
