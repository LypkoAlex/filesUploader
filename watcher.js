#!/usr/bin/env node
const argv = require('optimist')
    .usage('Watcher for file upload.')
    .demand(['h', 'p'])
    .alias('h', 'host')
    .alias('p', 'port')
    .alias('s', 'session')
    .argv
;
var status = require('node-status')
const console = status.console();
const statuses = {};

var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
      console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
      console.log('WebSocket Client Connected');
      connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
      });
      connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
      });
      connection.on('message', function(message) {
          if (message.type === 'utf8') {
              console.log("Received: '" + message.utf8Data + "'");
              const data = JSON.parse(message.utf8Data)
              if (data.session) return
              if(!statuses[data.file]) {
                statuses[data.file] = status.addItem(data.file, { max : 100 })
                status.start()
              }
              statuses[data.file].inc(data.status)
          }
      });
});

client.connect(`ws://${argv.host}:${argv.port}/`);

console.log(argv)
