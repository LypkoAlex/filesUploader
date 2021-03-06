#!/usr/bin/env node
const argv = require('optimist')
    .usage('Watcher for file upload.')
    .demand(['h', 'p'])
    .alias('h', 'host')
    .alias('p', 'port')
    .alias('s', 'session')
    .argv
;
const Multiprogress = require('multi-progress');
const multi = new Multiprogress(process.stderr);

const statuses = {};

const WebSocketClient = require('websocket').client;

const client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log(`Client Connected to ws://${argv.host}:${argv.port}/`);
    connection.send(JSON.stringify({ type : 'INIT', session : argv.session }));


    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Connection Closed');
    });
    connection.on('message', messageHandler);
});

function messageHandler(message) {
    if (message.type === 'utf8') {
        const { data, type} = JSON.parse(message.utf8Data);
        if (type === 'INIT') console.log(`SESSION ID: ${data.session}`);
        if (type === 'INFO') console.log(`INFO: ${data.msg}`);
        if (type === 'FINISH') {
            statuses[data.file].bar.interrupt(`MD5 HASH for ${data.file} => ${data.hash}`);
            if (Object.keys(statuses).length === 1) process.stdout.clearLine();
            delete statuses[data.file];
        }
        if (type === 'STATUS') {
            if (!statuses[data.file]) {
                statuses[data.file] = { bar : multi.newBar(` ${data.file} [:bar] :percent`, {
                    complete: '=',
                    incomplete: ' ',
                    width: 30,
                    total:  100
                }),
                status : 0
                };
            }
            const fileStatus = parseInt(data.status);
            if (statuses[data.file].status < fileStatus) {
                statuses[data.file].bar.tick(fileStatus - statuses[data.file].status);
                statuses[data.file].status = fileStatus;
            }
        }
    }
}

client.connect(`ws://${argv.host}:${argv.port}/`);
