(function() {
    'use strict';

    var module = angular.module('BloomAdminD3App.directives', [
        'lib.lodash'
    ]);

    module.controller('pieChartCtrl', function($scope) {
        $scope.roundPopForDisplay = function(num) {
            return Math.round((num * 100) * 100) / 100;
        };

        var pie, arc, svg, path, _current;

        $scope.colors = d3.scale.category20();

        $scope.radius = function() {
            return Math.min($scope.width, $scope.height) / 2;
        };

        $scope.init = function() {
            pie = d3.layout.pie()
                .value(function(d) { return d.population; })
                .sort(null);

            arc = d3.svg.arc()
                .innerRadius($scope.radius() - 100)
                .outerRadius($scope.radius() - 20);

            svg = d3.select("div#" + $scope.pieContainerId)
                .append("svg")
                .attr("width", $scope.width)
                .attr("height", $scope.height)
                .append("g")
                .attr("transform", "translate(" + $scope.width / 2 + "," + $scope.height / 2 + ")");

            path = svg.data([$scope.data])
                .selectAll("path")
                .data(pie)
                .enter().append("path")
                .attr("fill", function(d, i) { return $scope.colors(i); })
                .attr("d", arc)
                .each(function(d) { _current = d; }); // store the initial angles

            transition();
        };

        function transition() {
            path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
        }

        // Store the displayed angles in _current.
        // Then, interpolate from _current to the new angles.
        // During the transition, _current is updated in-place by d3.interpolate.
        function arcTween(a) {
            var i = d3.interpolate(_current, a);
            _current = i(0);
            return function(t) {
                return arc(i(t));
            };
        }

        $scope.change = function() {
            path = svg.data([$scope.data])
                .selectAll("path")
                .data(pie);
            transition();
        };

        $scope.legendCircleCss = function(i) {
            var color = $scope.colors(i);
            return 'background-image: -webkit-radial-gradient(-45px 45px, circle cover, ' + color + ', ' + color + ');';
        };
    });

    module.directive('piechart', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                pieContainerId: '@',
                data: '=',
                width: '=',
                height: '='
            },
            controller: 'pieChartCtrl',
            link: function postLink(scope, iElement, iAttrs, controller) {
                scope.$watch('data', function(newValue, oldValue) {
                    if (newValue && !oldValue) {
                        //console.log('init data:', scope.data);
                        scope.init();
                    } else if (newValue) {
                        //console.log('change data:', scope.data);
                        scope.change();
                    }
                });
            },
            templateUrl: 'partials/piechart.html'
        };
    });

    module.controller('barChartCtrl', function($scope) {

        // TODO reuse with above
        $scope.roundPopForDisplay = function(num) {
            return Math.round((num * 100) * 100) / 100;
        };

        var barHeight, x, chart, bar;

        $scope.init = function() {
            barHeight = $scope.height / $scope.data.length;

            x = d3.scale.linear()
                .domain([0, d3.max($scope.data, function(d) { return d.population; })])
                .range([0, $scope.width]);

            chart = d3.select("div#" + $scope.barContainerId + " .bar-chart")
                .attr("width", $scope.width)
                .attr("height", barHeight * $scope.data.length);

            bar = chart.selectAll("g")
                .data($scope.data)
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

            bar.append("rect")
                .attr("width", function(d) { return x(d.population); })
                .attr("height", barHeight - 1);

            bar.append("text")
                .attr("class", "bar-text")
                .attr("x", function(d) { return x(d.population) - 3; })
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .text(function(d) { return $scope.roundPopForDisplay(d.population) + "%"; });

            bar.append("text")
                .attr("class", "bar-label")
                .attr("x", 3)
                .attr("y", barHeight / 2)
                .attr("dy", ".35em")
                .text(function(d) { return d.type; });
        };

        $scope.change = function() {

        };
    });

    module.directive('bargraph', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                barContainerId: '@',
                data: '=',
                width: '=',
                height: '='
            },
            controller: 'barChartCtrl',
            link: function postLink(scope, iElement, iAttrs, controller) {
                scope.$watch('data', function(newValue, oldValue) {
                    if (newValue && !oldValue) {
                        scope.init();
                    } else if (newValue) {
                        scope.change();
                    }
                });
            },
            templateUrl: 'partials/bargraph.html'
        };
    });

    module.controller('memberListCtrl', ['$scope', '_', function($scope, _) {
        _.each($scope.members, function(member) {
            member.isActive = false;
        });
    }]);

    module.directive('memberList', function() {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                members: '='
            },
            controller: 'memberListCtrl',
            templateUrl: 'partials/memberList.html'
        };
    });

})();
