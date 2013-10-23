(function() {
    'use strict';

    angular.module('lib.lodash', [])
        .factory('_', function() {
            return window._;
        });
})();