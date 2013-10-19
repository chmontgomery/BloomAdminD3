'use strict';

angular.module('BloomAdminD3App')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.planYear = 2013;
        $scope.havePurchaseStats = null;

        $http.get('/havePurchase/' + $scope.planYear.toString()).success(function(data) {
            $scope.havePurchaseStats = data;
        });
    });
