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
                        scope.init();
                    } else if (newValue) {
                        scope.change();
                    }
                });
            },
            templateUrl: 'partials/piechart.html'
        };
    });

    module.controller('barChartCtrl', function($scope) {

        var margin, height, width, x, y, xAxis, yAxis, svg, formatPercent, color;

        $scope.init = function() {
            margin = {top: 20, right: 20, bottom: 30, left: 50};
            width = $scope.width - margin.left - margin.right;
            height = $scope.height - margin.top - margin.bottom;

            formatPercent = d3.format(".0%");

            color = d3.scale.category20c();

            $scope.change();
        };

        $scope.change = function() {

            d3.select("div#" + $scope.barContainerId + " svg").remove();

            x = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.1);

            y = d3.scale.linear()
                .range([$scope.height, 0]);

            xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(formatPercent);

            svg = d3.select("div#" + $scope.barContainerId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            x.domain($scope.data.map(function(d) { return d.type; }));
            y.domain([0, d3.max($scope.data, function(d) { return d.population; })]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");

            svg.selectAll(".bar")
                .data($scope.data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.type); })
                .attr("width", x.rangeBand())
                .attr("y", function(d) { return y(d.population); })
                .attr("height", function(d) { return height - y(d.population); })
                .style("fill", function(d) { return color(d.population); });
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

    module.controller('bubbleChartCtrl', function($scope) {

        var svg, bubble;

        //TODO share via service?
        $scope.roundPopForDisplay = function(num) {
            return Math.round((num * 100) * 100) / 100;
        };

        $scope.init = function() {
            $scope.change();
        };

        function hack(d) {
            if (d.type === 'Yes') {
                return ($scope.diameter/2) + 130;
            } else {
                return ($scope.diameter/2) - 130;
            }
        }

        function animateFirstStep(){
            d3.select(this)
                .transition()
                .delay(0)
                .duration(1000)
                .attr("r", function(d) {
                    return circleRadius(d) / 2;
                })
                .each("end", animateSecondStep);
        }

        function animateSecondStep(){
            d3.select(this)
                .transition()
                .duration(1000)
                .attr("r", circleRadius);
        }

        function circleRadius(d) {
            return d.population * 200;
        }

        $scope.change = function() {
            var color = d3.scale.category20c();

            bubble = d3.layout.pack()
                .sort(null)
                .size([$scope.diameter, $scope.diameter])
                .padding(1.5);

            d3.select("div#" + $scope.bubbleContainerId + " svg").remove();

            svg = d3.select("div#" + $scope.bubbleContainerId)
                .append("svg")
                .attr("width", +$scope.diameter)
                .attr("height", +$scope.diameter)
                .attr("class", "bubble");

            var node = svg.selectAll(".node")
                .data($scope.data)
                .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + ($scope.diameter/2) + "," + hack(d) + ")"; });

            node.append("title")
                .text(function(d) { return d.type; });

            var tooltip = d3.select("body")
                .append("div")
                .attr("class", "simple-tooltip");

            node.append("circle")
                .attr("r", circleRadius)
                .style("fill", function(d) { return color(d.population); })
                .on("mouseover", function(d){
                    d3.select(this).style("fill", "#faa732");
                    tooltip.text(d.type + ': ' + $scope.roundPopForDisplay(d.population) + '%');
                    return tooltip.style("visibility", "visible");
                })
                .on("mousemove", function(){
                    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                })
                .on("mouseout", function(d){
                    d3.select(this).style("fill", color(d.population));
                    tooltip.text('');
                    return tooltip.style("visibility", "hidden");
                })
                .on("mousedown", animateFirstStep);

            node.append("text")
                .attr("dy", ".3em")
                .style("text-anchor", "middle")
                .text(function(d) { return d.type; });
        };
    });

    module.directive('bubbleChart', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                bubbleContainerId: '@',
                data: '=',
                diameter: '='
            },
            controller: 'bubbleChartCtrl',
            link: function postLink(scope, iElement, iAttrs, controller) {
                scope.$watch('data', function(newValue, oldValue) {
                    if (newValue && !oldValue) {
                        scope.init();
                    } else if (newValue) {
                        scope.change();
                    }
                });
            },
            templateUrl: 'partials/bubblechart.html'
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
