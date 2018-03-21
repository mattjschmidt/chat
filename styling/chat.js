var socket = io();
var username = "";
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
	var now = Date.now();
    var chatObj = {message: messageField};
    $('#messages').append($('<div class="sent" id=' + username + now + '>'));
	$('#' + username + now).append($('<p class="test">')).text(username + ": " + chatObj.message);
    socket.emit('chat message', chatObj);
    $('#message').val('');
    return false;
  });
  socket.on('chat message', function(chatObj){
    if(chatObj.id != socket.id){
      play();
      $('#messages').append($('<div class="received" id=' + chatObj.username + chatObj.time + '>').text(chatObj.username + ": " + chatObj.message));
	  $('#' + chatObj.username + chatObj.time).text(chatObj.username + ": " + chatObj.message);
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  socket.on('typing', function(usersTyping){
    if(!(usersTyping.length == 1 && usersTyping[0] == username)){
      document.getElementById('typingArea').style.display='block';
      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  socket.on('done typing', function(usersTyping){
    document.getElementById('typingArea').style.display='none';
  });
  socket.on('user connected', function(user){
    username = user;
    $('#messages').append($('<div class="welcome" style="text-align: center;">').text(user + " has joined the chat."));
  });
  socket.on('user disconnected', function(username){
    $('#messages').append($('<div class="welcome" style="text-align: center;">').text(username + " has left."));
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
