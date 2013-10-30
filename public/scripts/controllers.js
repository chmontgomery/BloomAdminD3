(function() {
    'use strict';

    var module = angular.module('BloomAdminD3App.controllers', []);

    module.controller('MainCtrl', function ($scope, $http) {
        $scope.planYear = 2013;
        $scope.havePurchaseStats = null;
        $scope.members = [];
        $scope.selectedEmployer = null;
        $scope.employers = [];

        $scope.loadMembersForEmployer = function() {
            if ($scope.selectedEmployer) {
                $http.get('/members/' + $scope.selectedEmployer.id).success(function(data) {
                    $scope.members = data;
                });
            }
        };

        $http.get('/havePurchase/' + $scope.planYear.toString()).success(function(data) {
            $scope.havePurchaseStats = data;
        });

        $http.get('/employers').success(function(data) {
            $scope.employers = data;
        });
    });
})();
