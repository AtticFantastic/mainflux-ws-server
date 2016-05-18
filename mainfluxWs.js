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

        console.log(typeof msg);

        var jmsg = JSON.parse(msg);

        console.log(typeof jmsg);
        console.log(jmsg);

        /**
         * WS client can subscribe on per device subject
         * or just send commands to Core via NATS (ex. `getDevices`)
         */
        if (jmsg.method === 'subscribe') {
            console.log('SUBSCRIBING...');

            //nats.subscribe('devices.' + msg.body.deviceId, function(upd) {
            nats.subscribe('core_out', function(upd) {
                console.log('Received a message: ' + upd);
                /** Recieved message from NATS is string type, we can send it right away to WS */
                ws.send(upd);
            });
        } else {
            nats.request('core_in', JSON.stringify(msg), {'max':1}, function(rsp) {
                /**
                 * WS is a stream - only accepts strings, not JSON objects.
                 * But that is OK, messages that arrive from NATS are pure strings,
                 * we can send them directly to WS.
                 */
                ws.send(rsp);
            });
        }
    });

});

console.log('WS magic happens on port ', config.ws.port);

/**
 * Exports
 */
module.exports = wsServer;
