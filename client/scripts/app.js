var App = function() {
  this.username = URI(window.location.href).search(true).username;
  this.server = 'https://api.parse.com/1/classes/chatterbox';
  this.rooms = [];
  this.currentRoom = 'all';
  this.friends = [];
};

App.prototype.init = function() {
  //fetch message data periodically
  var self = this;
  setInterval(self.fetch.bind(self), 500);
};

App.prototype.send = function(message) {
  $.ajax({
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {},
    error: function(data) {
      console.log("Failed to send")
    }
 });
};

App.prototype.fetch = function() {
  var self = this;
  $.ajax({
    url: this.server,
    type: 'GET',
    contentType: 'application/json',
    success: function(data) {
      self.clearMessages();
      self.addMessages(data.results);
      self.updateRooms(data.results)
    },
    error: function(data) {
      console.log('Failed to retreive');
    }
  });
};

App.prototype.updateRooms = function(data) { 
  _.each(data, function(message) {
    if (this.rooms.indexOf(message.roomname) === -1 && typeof message.roomname === 'string') {
      this.rooms.push(message.roomname);
      
      //using stringjs lib to escape html comments
      var roomname = this.sanitizeString(message.roomname);
      var $option = $('<option value="'+roomname+'">' + roomname + '</option>');
      $('#roomSelect').append($option);      
    }
  }, this);
  $('#roomSelect').val(app.currentRoom);
}

App.prototype.clearMessages = function() {
  $('#messages').html('');
};

App.prototype.addMessage = function(message) {
  if (message.roomname === this.currentRoom || this.currentRoom === 'all') {
    var $li = $('<li><span id="username"></span>:<br /><span id="body"></span></li>');
    //using stringjs lib to escape html comments
    $li.children('#username').text(this.sanitizeString(message.username));
    $li.children('#body').text(this.sanitizeString(message.text));
    $li.children('span#username').on('click', function(e) {
      app.addFriend.call(app, e);
    });

    if (this.friends.indexOf(this.sanitizeString(message.username)) !== -1) {
      $li.children('#username').toggleClass('friend');
    }

    $('#messages').append($li);
  }
};

App.prototype.addMessages = function(messages) {
  _.each(messages, this.addMessage, this);
};

App.prototype.addRoom = function(roomname) {
  app.currentRoom = roomname;
  app.updateRooms([{
    roomname: app.currentRoom
  }]);

  app.send({
    username: "chatterbox",
    text: "Welcome to " + app.currentRoom + "!",
    roomname: app.currentRoom
  });

  $('#main form#roomName input[type=text]').val('');
  $('#roomSelect').val(app.currentRoom);  
}

App.prototype.sanitizeString = function(string) {
  var clean = typeof string === 'string' ? string : '';
  return S(clean).escapeHTML().s;
};

App.prototype.handleSubmit = function(e) {
  e.preventDefault();

  app.send({
    username: app.username,
    text: $('#main form#message input[type=text]').val(),
    roomname: app.currentRoom
  });

  $('#main form#message input[type=text]').val('');
};

App.prototype.addFriend = function(e) {
  var friend = $(e.target).text();
  console.log(friend);

  if (this.friends.indexOf(friend) === -1) {
    this.friends.push(friend);
  } else {
    this.friends.splice(this.friends.indexOf(friend), 1);
  }
};

/*Initializing*/
var app = new App();
app.init();

/*Event Listeners*/
$(document).ready(function() {
  $('#main form#message').on("submit", app.handleSubmit);

  $('#roomSelect').on('change', function() {
    app.currentRoom = $(this).val();
  });

  $('#main form#roomName').on("submit", function(e) {
    e.preventDefault();

    app.addRoom($('#main form#roomName input[type=text]').val());
  });
});
