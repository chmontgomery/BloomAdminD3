(function() {
    'use strict';

    var module = angular.module('BloomAdminD3App.controllers', []);

    module.controller('MainCtrl', ['$scope', '$http', '$q', function ($scope, $http, $q) {
        $scope.completedPurchases = null;
        $scope.purchaseNames = null;
        $scope.members = [];
        $scope.selectedEmployer = null;
        $scope.employers = [];
        $scope.purchases = [];
        $scope.viewType = {
            PIE: 'PIE',
            BAR: 'BAR',
            BUBBLE: 'BUBBLE'
        };
        $scope.viewDrop = [{
            type: $scope.viewType.PIE,
            label: 'pie chart'
        },{
            type: $scope.viewType.BAR,
            label: 'bar graph'
        },{
            type: $scope.viewType.BUBBLE,
            label: 'bubble chart'
        }];
        $scope.selectedView = $scope.viewDrop[0];
        $scope.showViewWhen = function(type) {
            return $scope.selectedView.type === type;
        };
        $scope.loadingData = false;
        $scope.loadButtonText = function() {
            if ($scope.loadingData) {
                return 'crunching the data...';
            }
            return 'Load Employer Data';
        };

        function deferredGet(url) {
            var deferred = $q.defer();
            $http.get(url)
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function (data, status) {
                    if (status) {
                        deferred.reject(status);
                    }
                });
            return deferred.promise;
        }

        $scope.loadEmployerStats = function() {
            if ($scope.selectedEmployer && !$scope.loadingData) {
                $scope.loadingData = true;
                var url = '/completedPurchases/' + $scope.selectedEmployer.id;
                var promise = deferredGet(url);
                promise.then(function(data) {
                    $scope.completedPurchases = data;
                    $scope.loadingData = false;
                }, function() {
                    $scope.loadingData = false;
                });
            }
        };

        $http.get('/employers').success(function(data) {
            $scope.employers = data;
        });
    }]);
})();
