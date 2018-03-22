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
    var chatObj = {message: $('#message').val()};
    socket.emit('chat message', chatObj);
    $('#message').val('');
    return false;
  });
  socket.on('chat message', function(chatObj){
    if (chatObj.id != socket.id){ //Message received
      play();

      if($('#messages')[0].lastChild.lastChild.textContent == chatObj.username) {
        $('#messages')[0].lastChild.lastChild.style = 'display: none;';
      }

      var received = document.createElement('div');
      received.id = chatObj.id + chatObj.time + 'received';
      received.className = 'receivedDiv';
      $('#messages')[0].appendChild(received);

      var message = document.createElement('div');
      message.className = 'receivedMessage';
      message.innerHTML = chatObj.message;

      received.appendChild(message);

      var usernameDiv = document.createElement('div');
      usernameDiv.className = 'usernameDiv';
      usernameDiv.id = chatObj.id + chatObj.time + 'usernameAndDate';
      received.appendChild(usernameDiv);

      var usernameField = document.createElement('div');
      usernameField.className = 'usernameAndDate';
      usernameField.innerHTML = chatObj.username;

      usernameDiv.appendChild(usernameField);

      if (chatObj.message.includes("https://www.youtube.com/watch?v=")) {
        message.innerHTML = "";
        message.style = 'position:relative; padding-bottom:56.25%; padding-top:30px; height:0; overflow:hidden;';
        
        var youtubeIframe = document.createElement('iframe');
        youtubeIframe.src = "https://www.youtube.com/embed/" + chatObj.message.substring(chatObj.message.indexOf('=')+1);
        youtubeIframe.style = 'border-radius: 20px; width: 560px; height: 315px;';
        youtubeIframe.frameBorder = 0;
        youtubeIframe.allowFullscreen = true;
        youtubeIframe.allow = 'encrypted-media';
        message.appendChild(youtubeIframe);
      }

      window.scrollTo(0, document.body.scrollHeight);
    }
    else { //Message sent
      var sent = document.createElement('div');
      sent.id = chatObj.id + chatObj.time + 'sent';
      sent.className = 'sentDiv';
      $('#messages')[0].appendChild(sent);

      var message = document.createElement('div');
      message.className = 'sentMessage';
      message.innerHTML = chatObj.message;

      sent.appendChild(message);
      if (chatObj.message.includes("https://www.youtube.com/watch?v=")) {
        message.innerHTML = "";

        var div = document.createElement('div');
        div.className = 'inner';
        div.style = 'margin: 0px auto; width: 10%; min-width: 100px; min-height: 50px;' ;
        message.appendChild(div);
        
        var youtubeIframe = document.createElement('iframe');
        youtubeIframe.src = "https://www.youtube.com/embed/" + chatObj.message.substring(chatObj.message.indexOf('=')+1);
        youtubeIframe.style = 'border-radius: 20px;';
        youtubeIframe.frameBorder = 0;
        youtubeIframe.allowFullscreen = true;
        youtubeIframe.allow = 'encrypted-media';
        div.appendChild(youtubeIframe);
      }
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
