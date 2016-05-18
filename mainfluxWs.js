/**
 * Copyright (c) Mainflux
 *
 * Mainflux server is licensed under an Apache license, version 2.0 license.
 * All rights not explicitly granted in the Apache license, version 2.0 are reserved.
 * See the included LICENSE file for more details.
 */

var config = require('./config');
var nats = require('nats').connect('nats://' + config.nats.host + ':' + config.nats.port);

var WebSocketServer = require('ws').Server;

/** Use `wss://` for secure connections */
var wsServer = new WebSocketServer({ host: config.ws.port, port: config.ws.port});

wsServer.on('connection', function(ws) {
    ws.on('message', function(msg) {
        console.log('received: %s', msg);

        /**
         * WS client can subscribe on per device subject
         * or just send commands to Core via NATS (ex. `getDevices`)
         */
        if (jmsg.method === 'subscribe') {
            console.log('SUBSCRIBING...');

            nats.subscribe('devices.' + msg.body.deviceId + '.attributes.' + msg.body.attribute, function(upd) {
                console.log('Received a message: ' + upd);
                /** Recieved message from NATS is string type, we need to convert it to JSON */
                ws.send(JSON.parse(upd));
            });
        } else {
            nats.request('core_in', JSON.stringify(msg), {'max':1}, function(rsp) {
                ws.send(JSON.parse(rsp));
            });
        }
    });

});

console.log('WS magic happens on port ', config.ws.port);

/**
 * Exports
 */
module.exports = wsServer;
