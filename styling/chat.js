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
    if ($('#message').val() != '') {
      var messageField = document.getElementById('message').value;
      var chatObj = {message: $('#message').val()};
      socket.emit('chat message', chatObj);
      $('#message').val('');
      return false;
    }
    else {
      return false;
    }
  });
  socket.on('chat message', function(chatObj){
    if (chatObj.id != socket.id){ //Message received
      play();

      var lastMessageUsernameText = $('#messages')[0].lastChild.lastChild.textContent;
      if(lastMessageUsernameText.substring(0, lastMessageUsernameText.indexOf(" •")) == chatObj.username) {
        $('#messages')[0].lastChild.lastChild.style = 'display: none;';
      }

      var received = document.createElement('div');
      received.id = chatObj.id + chatObj.time.string + 'received';
      received.className = 'receivedDiv';
      $('#messages')[0].appendChild(received);

      var message = document.createElement('div');
      message.className = 'receivedMessage';
      message.innerHTML = chatObj.message;

      received.appendChild(message);

      var usernameDiv = document.createElement('div');
      usernameDiv.className = 'usernameDiv';
      usernameDiv.id = chatObj.id + chatObj.time.string + 'usernameAndDate';
      received.appendChild(usernameDiv);

      var usernameField = document.createElement('div');
      usernameField.className = 'usernameAndDate';
      if (chatObj.time.hour > 12) {
        chatObj.time.hour = chatObj.time.hour - 12;
        chatObj.time.hourSuffix = "PM";
      }
      else {
        chatObj.time.hourSuffix = "AM";
      }
      usernameField.innerHTML = chatObj.username + " • " + chatObj.time.dayOfWeek.substring(0,3) + " " + chatObj.time.hour + ":" + chatObj.time.min + " " + chatObj.time.hourSuffix;

      usernameDiv.appendChild(usernameField);

      window.scrollTo(0, document.body.scrollHeight);
    }
    else { //Message sent
      var sent = document.createElement('div');
      sent.id = chatObj.id + chatObj.time.string + 'sent';
      sent.className = 'sentDiv';
      $('#messages')[0].appendChild(sent);

      var message = document.createElement('div');
      message.className = 'sentMessage';
      message.innerHTML = chatObj.message;

      sent.appendChild(message);

      window.scrollTo(0, document.body.scrollHeight);
    }
  });
  socket.on('typing', function(usersTyping){
    document.getElementById('typingArea').style.display='block';
    window.scrollTo(0, document.body.scrollHeight);
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
