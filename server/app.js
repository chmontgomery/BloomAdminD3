var express = require('express'),
    path = require('path'),
    http = require('http'),
    _ = require('lodash-node'),
    app = express(),
    mockData = require('./testData.js'),
    socket;

app.configure(function() {
    // Turn down the logging activity
    //app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'../public')));

    app.use(express.bodyParser());

    app.get('/havePurchase/:planYear', function(req, res) {
        //var planYear = req.params.planYear;

        var planYearBloomId = "696EC308119A11E1942912313F047E54";

        var members = mockData.getMedicaMembers();

        _.each(members, function(member) {
            if (!(Math.floor(Math.random() * 3))) {
                member.purchases = mockData.getMockPurchases();
            }
        });

        var total = members.length;
        var membersWhoMadePurchases = _.filter(members, function(member) {
            return member.purchases && member.purchases.length > 0;
        });
        var data = [{
            type: 'Yes',
            population: membersWhoMadePurchases.length/total
        }, {
            type: 'No',
            population: (total - membersWhoMadePurchases.length)/total
        }];

        console.log('returning json');

        res.json(data);
    });

    app.get('/members', function(req, res) {
        res.json(mockData.getMedicaMembers());
    });
});

var server = require('http').createServer(app).listen(8001);

var io = require('socket.io').listen(server);

var consumerUrl = 'https://vagrant.moolb.com';
var io_consumer = require('socket.io').listen(consumerUrl);

// Reduce the logging output of Socket.IO
io.set('log level', 1);
io_consumer.set('log level', 1);

io.sockets.on('connection', function (aSocket) {
    socket = aSocket;
    console.log('a client connected');
    socket.emit('connected', { message: "You are connected!" });
});

io_consumer.sockets.on('connection', function (aSocket) {
    socket = aSocket;
    console.log('a consumer client connected');
    socket.emit('connected', { message: "You are connected!" });
});