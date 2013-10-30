var express = require('express'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    q = require('q'), // promises library
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

        res.json(data);
    });

    function readConfig(endpoint) {
        var configFile = 'config.json',
            deferred = q.defer();
        fs.readFile(path.resolve(__dirname, configFile), 'utf8', function(err, data) {
            if (err) {
                deferred.reject(new Error("ERROR reading " + configFile + " -> " + err));
            } else {
                deferred.resolve(JSON.parse(data).endpoints[endpoint]);
            }
        });
        return deferred.promise;
    }

    function getMembers(options, employerId) {
        var deferred = q.defer();
        options.path = options.path.replace('{employerId}', employerId);
        http.get(options, function(res) {
            var data = '';
            res.on('data', function(chunk){
                data += chunk;
            });
            res.on('end',function(){
                var allData;
                try {
                    allData = JSON.parse(data);
                    deferred.resolve(allData);
                } catch(e) {
                    deferred.reject(new Error("ERROR parsing response from " + options.hostname + ":" + options.port + options.path + " :" + e));
                }
            });
        }).on("error", function(error){
                deferred.reject(new Error("ERROR calling " + options.hostname + ":" + options.port + options.path + " :" + error));
            });
        return deferred.promise;
    }

    app.get('/members/:employerId', function(req, res) {
        var employerId = req.params.employerId;
        readConfig('members_employer').then(function(data) {
            return getMembers(data, employerId);
        }).then(function(members) {
            console.log("returning", members.length, "members for employer id", employerId);
            res.json(members);
        }).fail(function(error) {
                console.log('ERROR getting members: ', error);
            });
    });

    app.get('/employers', function(req, res) {
        // TODO service call for this data
        res.json([{
            id: 3,
            name: 'Refactr'
        },{
            id: 49,
            name: 'Bloom Health'
        },{
            id: 102,
            name: 'Medica'
        },{
            id: 260,
            name: 'City of Pontiac'
        }]);
    });
});

var server = http.createServer(app).listen(8001);

var io = require('socket.io').listen(server);

var io_consumer = require('socket.io').listen(server,{origins:'*https://vagrant.moolb.com'});

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