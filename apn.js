/* apn.js
 * @author kevin
 */

 'use strict';

var apn = require('apn');
var zmq = require('zmq');
var gcm = require('node-gcm');
var gcm_sender = new gcm.Sender('AIzaSyAwwjrZ_RkwmCFx5Gs8ENKQvVABgZ22W4g');

var options = { };
var apnConnection = new apn.Connection(options);

var subSock = zmq.socket('sub');
subSock.connect('tcp://127.0.0.1:4000');

// subscribe to events
subSock.subscribe('chat_message');

//listener for a new chat message
subSock.on('message', function(event, data) {
  event = event.toString();
  data = JSON.parse(data.toString());
  var message = data.message;
  var to_users = data.to_users;
  var thread = message.thread;
  var author = message.author;
  
  //for all users in a thread
  for(var i in to_users) {
    var user = to_users[i];
    // send a notification to all devices
    for(var j in user.devices) {
      var device = user.devices[j];
      console.log('sending to ', user.displayName, ' ', device.id);

      if(device.platform == 'ios') {
        var iosDevice = new apn.Device(device.token);
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 3;
        note.sound = "ping.aiff";
        note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
        note.payload = {'messageFrom': author.displayName};

        apnConnection.pushNotification(note, iosDevice);
      } else if (device.platform == 'android') {
        
      }
    }
  }
});