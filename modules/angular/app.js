var app = angular.module('courseMapper', ['ngResource', 'ngRoute']);

app.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.controller('TreeController', function($scope, $http, $rootScope) {
    $scope.treeData = {
            name: 'Web Tech',
            subTopics:[
                {
                    name: 'Server Side Technology',
                    resources:[
                        {
                            type: 'pdf'
                        },{
                            type: 'pdf'
                        },{
                            type: 'video'
                        }
                    ],
                    lessons: [
                        {
                            name: 'Introduction to server Side Technology',
                            resources: [
                                {
                                    type: 'pdf'
                                }
                            ]
                        },
                        {
                            name: 'Distributed Server',
                            resources: [
                                {
                                    type: 'video'
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Client Side Technology',
                    resources:[
                        {
                            type: 'pdf'
                        },{
                            type: 'pdf'
                        },{
                            type: 'pdf'
                        }
                    ],
                    lessons:[
                        {
                            name: 'Introduction to Client Side Technology',
                            resources: [
                                {
                                    type: 'pdf'
                                }
                            ]
                        },
                        {
                            name: 'Web Standards',
                            resources: [
                                {
                                    type: 'pdf'
                                }
                            ]
                        }
                    ]
                }
            ],

            resources:[
                {
                    type: 'pdf'
                },
                {
                    type: 'video'
                }

            ]
        };

    var m = [20, 120, 20, 120],
        w = 1280 - m[1] - m[3],
        h = 800 - m[0] - m[2],
        i = 0;

    var vis = d3.select('#tree').append('svg:svg')
        .attr('width', w + m[1] + m[3])
        .attr('height', h + m[0] + m[2])
        .append('svg:g')
        .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');

    var node = vis.selectAll('circle')
        .data($scope.treeData)
        .enter()
        .append('circle');

    var nodeAttr = node
        .attr('cx', function(d){return d.x_axis;})
        .attr('cy', function(d){return d.y_axis;})
        .attr('r', function(d){return 5;})

});

