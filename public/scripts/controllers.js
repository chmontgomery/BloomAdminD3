(function() {
    'use strict';

    var module = angular.module('BloomAdminD3App.controllers', []);

    module.controller('MainCtrl', function ($scope, $http) {
        $scope.havePurchaseStats = null;
        $scope.members = [];
        $scope.selectedEmployer = null;
        $scope.employers = [];
        $scope.purchases = [];

        $scope.loadEmployerStats = function() {
            if ($scope.selectedEmployer) {
                $http.get('/members/' + $scope.selectedEmployer.id).success(function(data) {
                    $scope.members = data;
                });
                $http.get('/purchases/' + $scope.selectedEmployer.id).success(function(data) {
                    $scope.purchases = data;
                });
            }
        };


        $http.get('/employers').success(function(data) {
            $scope.employers = data;
        });
    });
})();
