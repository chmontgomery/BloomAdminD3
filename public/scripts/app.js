(function() {
    'use strict';

    angular.module('BloomAdminD3App', [
            'BloomAdminD3App.controllers',
            'BloomAdminD3App.directives'
        ])
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
})();