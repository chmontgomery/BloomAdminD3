(function() {
    'use strict';

    describe('Controller: MainCtrl', function () {

        // load the controller's module
        beforeEach(module('BloomAdminD3App.controllers'));

        var MainCtrl,
            $scope,
            $httpBackend,
            $controller;

        var mockHavePurchaseData = [{
            type: 'yes',
            population: 2
        }, {
            type: 'no',
            population: 3
        }];

        var mockMembers = [{
            firstName: 'Chris',
            lastName: 'Montgomery',
            bloomId: '12345',
            finishedShopping: false
        },{
            firstName: 'Adan',
            lastName: 'Perez',
            bloomId: '65453',
            finishedShopping: true
        }];

        // Initialize the controller and a mock scope
        beforeEach(inject(function ($injector) {
            $scope = $injector.get('$rootScope').$new();
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
        }));

        it('should init and call 2 services', function () {
            $httpBackend.expectGET('/havePurchase/2013').respond(mockHavePurchaseData);
            $httpBackend.expectGET('/members').respond(mockMembers);
            MainCtrl = $controller('MainCtrl', {
                $scope: $scope
            });
            $httpBackend.flush();
            expect($scope.members).toBe(mockMembers);
            expect($scope.havePurchaseStats).toBe(mockHavePurchaseData);
        });
    });
})();
