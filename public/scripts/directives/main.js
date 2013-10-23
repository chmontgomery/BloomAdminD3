(function() {

    var module = angular.module('common.charts', [
        'lib.lodash'
    ]);

    module.controller('pieChartCtrl', function($scope) {
        $scope.pieChart = {
            initialize: function(datajson) {
                this.datajson = datajson;
            },
            workOnElement: function(element) {
                this.element = element;
            },
            generateGraph: function() {
                var radius = Math.min($scope.width, $scope.height) / 2;

                var color = d3.scale.ordinal()
                    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.population; });

                var svg = d3.select(this.element).append("svg")
                    .attr("width", $scope.width)
                    .attr("height", $scope.height)
                    .append("g")
                    .attr("transform", "translate(" + $scope.width / 2 + "," + $scope.height / 2 + ")");


                    this.datajson.forEach(function(d) {
                        d.population = +d.population;
                    });

                    var g = svg.selectAll(".arc")
                        .data(pie(this.datajson))
                        .enter().append("g")
                        .attr("class", "arc");

                    g.append("path")
                        .attr("d", arc)
                        .style("fill", function(d) { return color(d.data.type); });

                    g.append("text")
                        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.data.type; });
            }
        };
    });

    module.directive('piechart', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: false,
            scope: {
                data: '=',
                width: '=',
                height: '='
            },
            controller: 'pieChartCtrl',
            link: function postLink(scope, iElement, iAttrs, controller) {
                scope.$watch('data', function(newValue, oldValue) {
                    if (newValue) {
                        console.log(iAttrs.id + ' data:', scope.data);
                        var html = "<div id='" + iAttrs.id + "' ></div>"; // the HTML to be produced
                        var newElem = $(html);
                        iElement.replaceWith(newElem); // Replacement of the element.
                        scope.pieChart.initialize(newValue);
                        scope.pieChart.workOnElement('#'+iAttrs.id);
                        scope.pieChart.generateGraph();  // generate the actual bar graph
                    }
                });
            }
        }
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
        }
    });

})();
