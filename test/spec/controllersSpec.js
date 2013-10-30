(function() {
    'use strict';

    describe('Controller: MainCtrl', function () {

        // load the controller's module
        beforeEach(module('BloomAdminD3App.controllers'));

        var MainCtrl,
            $scope,
            $httpBackend,
            $controller;

        var mockEmployers = [{
            name: 'Bloom',
            id: '12345'
        },{
            name: 'Pontiac',
            id: '65453'
        }];

        // Initialize the controller and a mock scope
        beforeEach(inject(function ($injector) {
            $scope = $injector.get('$rootScope').$new();
            $controller = $injector.get('$controller');
            $httpBackend = $injector.get('$httpBackend');
        }));

        it('should init and call 2 services', function () {
            $httpBackend.expectGET('/employers').respond(mockEmployers);
            MainCtrl = $controller('MainCtrl', {
                $scope: $scope
            });
            $httpBackend.flush();
            expect($scope.employers).toBe(mockEmployers);
        });
    });
})();
