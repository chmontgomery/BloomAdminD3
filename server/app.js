var express = require('express'),
    path = require('path'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    q = require('q'), // promises library
    _ = require('lodash-node'),
    app = express(),
    socket;

app.configure(function() {
    // Turn down the logging activity
    //app.use(express.logger('dev'));

    // Serve static html, js, css, and image files from the 'public' directory
    app.use(express.static(path.join(__dirname,'../public')));

    app.use(express.bodyParser());

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

    function getData(options, employerId) {
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
            return getData(data, employerId);
        }).then(function(members) {
                console.log("returning", members.length, "members for employer id", employerId);
                res.json(members);
            }).fail(function(error) {
                console.log('ERROR /members/:employerId: ', error);
                res.status(500).send('Internal Server Error');
            });
    });

    app.get('/purchases/:employerId', function(req, res) {
        var employerId = req.params.employerId;

        readConfig('purchases_employer').then(function(data) {
            return getData(data, employerId);
        }).then(function(purchases) {
                console.log("returning", purchases.length, "purchases for employer id", employerId);
                res.json(purchases);
            }).fail(function(error) {
                console.log('ERROR /purchases/:employerId: ', error);
                res.status(500).send('Internal Server Error');
            });
    });

    app.get('/completedPurchases/:employerId', function(req, res) {
        var employerId = req.params.employerId;

        q.all([
                readConfig('purchases_employer').then(function(data) {
                    return getData(data, employerId);
                })
                ,readConfig('members_employer').then(function(data) {
                    return getData(data, employerId);
                })
            ])
            .spread(function (purchases, members) {
                console.log("found", purchases.length, "purchases and", members.length, "members for employer", employerId);
                _.each(members, function(m) {
                    m.purchases = _.filter(purchases, function(p) {
                        return p.memberBloomId === m.bloomId;
                    })
                });
                var membersWhoMadePurchases = _.filter(members, function(m) {
                    return m.purchases && m.purchases.length > 0;
                });
                var data = [{
                    type: 'Yes',
                    population: membersWhoMadePurchases.length/members.length
                }, {
                    type: 'No',
                    population: (members.length - membersWhoMadePurchases.length)/members.length
                }];
                res.json(data);
            }).fail(function(error) {
                console.log('ERROR /completedPurchases/:employerId: ', error);
                res.status(500).send('Internal Server Error');
            });
    });

    /*app.get('/purchaseNames/:employerId', function(req, res) {
        var employerId = req.params.employerId;

        q.all([
                readConfig('purchases_employer').then(function(data) {
                    return getData(data, employerId);
                })
                ,readConfig('members_employer').then(function(data) {
                    return getData(data, employerId);
                })
            ])
            .spread(function (purchases, members) {

                console.log(purchases[0]);

                var purchaseCount = [];

                _.each(purchases, function(p) {
                    var counted = _.find(purchaseCount, function(pc) {
                        return p.productBloomId === pc.productBloomId;
                    });
                    if (counted) {
                        counted.count = counted.count++;
                    } else {
                        purchaseCount.push({
                            productBloomId: p.productBloomId,
                            productName: p.productName,
                            productType: p.productType,
                            count: 1
                        })
                    }
                });

                res.json(purchaseCount);
            });
    });*/

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
        },{
            id: 177,
            name: 'Mello Smello'
        },{
            id: 168,
            name: 'Michigan Catholic Conference'
        },{
            id: 169,
            name: 'Auto Club Group'
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