'use strict';

angular.module('BloomAdminD3App', ['AngularD3PieChart'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        var socket = io.connect();

        socket.on('connected', function(data) {
            console.log(data.message);
        });
    });
