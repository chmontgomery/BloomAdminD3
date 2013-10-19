var express = require('express'),
    path = require('path'),
    app = express(),
    socket;

app.configure(function() {
    // Turn down the logging activity
    //app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'public')));

    app.use(express.bodyParser());

    app.get('/oeStats', function(req, res) {

    });
});

var server = require('http').createServer(app).listen(9001);

var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level', 1);

io.sockets.on('connection', function (aSocket) {
    socket = aSocket;
    console.log('a client connected');
    socket.emit('connected', { message: "You are connected!" });
});