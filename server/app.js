var express = require('express'),
    path = require('path'),
    _ = require('lodash-node'),
    app = express(),
    socket;

app.configure(function() {
    // Turn down the logging activity
    //app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'../public')));

    app.use(express.bodyParser());

    var members = [
        {
            id: '12345',
            firstName: 'Chris',
            lastName: 'Montgomery',
            purchases: [{
                planYear: '2013',
                product: 'Waived Medical Insurance',
                status: 'Member Denied-Cancelled',
                effectiveDate: '2013-09-01'
            }]
        },
        {
            id: '12347',
            firstName: 'Phil',
            lastName: 'CreamCheese',
            purchases: [{
                planYear: '2013',
                product: 'Super Medical Insurance',
                status: 'Approved',
                effectiveDate: '2013-09-01'
            },{
                planYear: '2013',
                product: 'Gold Tooth',
                status: 'Approved',
                effectiveDate: '2013-09-01'
            }]
        },
        {
            id: '12346',
            firstName: 'Brooks',
            lastName: 'West',
            purchases: []
        }
    ];

    app.get('/havePurchase/:planYear', function(req, res) {
        var planYear = req.params.planYear;

        var total = members.length;
        var membersWhoMadePurchases = _.filter(members, function(member) {
            return _.filter(member.purchases, function(purchase) {
                return purchase.planYear === planYear;
            }).length > 0;
        });
        var data = [{
            age: 'yes',
            population: membersWhoMadePurchases.length/total
        }, {
            age: 'no',
            population: (total - membersWhoMadePurchases.length)/total
        }];
        res.json(data);
    });
});

var server = require('http').createServer(app).listen(8001);

var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
io.set('log level', 1);

io.sockets.on('connection', function (aSocket) {
    socket = aSocket;
    console.log('a client connected');
    socket.emit('connected', { message: "You are connected!" });
});