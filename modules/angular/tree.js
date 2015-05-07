/**
 * call this to allow dragging on your svg element el.call(drag)
 */
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);



/*function dragmove() {
    //if(modifier == null)
    //    modifier = {x:0, y:0};

    var x = d3.event.x;// - ($(this).attr("width")/2);
    var y = d3.event.y;// - ($(this).attr("height")/2);
    d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
}*/

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this)
        .attr("cx", d3.event.x)
        .attr("cy", d3.event.y)
        .attr('data-x', d3.event.x)
        .attr('data-y', d3.event.y)
    ;
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}

/**
 * to use this, create an element <cm-tree></cm-tree>
 */
app.directive('cmTree', function($timeout){
    /**
     * constructor of cm-tree
     */
    function link($scope, $element, $attrs, $ctrl){
        $scope.options = $attrs;
 
        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);

        function zoomed() {
            $scope.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        /**
         * d3 tree main object
         */
        $scope.vis = d3.select($element[0]).append("svg")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .attr("id", $attrs.el)

            //draggable and zoomable
                .append("g")
                .attr("transform", "translate(" + 0 + "," + 0 + ")")
                .call(zoom);

            /*.on("mousemove", function(){
                // Extract the click location
                var point = d3.mouse(this);
                $scope.mousePosition = {x: point[0], y: point[1] };
            });*/

        // rectangle so we can drag the map
        $scope.vis.append("rect")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .style("fill", "none")
            .style("pointer-events", "all");

        $scope.container = $scope.vis.append("g");
        /**
         * axis x lines
         */
        $scope.container.append("g")
            .attr("class", "x axis")
            .selectAll("line")
            .data(d3.range(0, $attrs.width, 10))
            .enter().append("line")
            .attr("x1", function(d) { return d; })
            .attr("y1", 0)
            .attr("x2", function(d) { return d; })
            .attr("y2", $attrs.height);

        /**
         * axis y lines
         */
        $scope.container.append("g")
            .attr("class", "y axis")
            .selectAll("line")
            .data(d3.range(0, $attrs.height, 10))
            .enter().append("line")
            .attr("x1", 0)
            .attr("y1", function(d) { return d; })
            .attr("x2", $attrs.width)
            .attr("y2", function(d) { return d; });

        $ctrl.init($element, $scope);
    }

    /**
     * when the svg has finished loading
     */
    $timeout(function () {
        //initDraggableUI();
        initMapContainer();
    });

    return {
        link: link,
        controller: 'TreeController',
        restrict: 'E'
    }
});

app.service('TreeService', function($document){
    var self = this;

    /**
     * a tree need a main topic
     */
    this.createMainTopic = function($scope, $params){
        var pos = $scope.mousePosition;
        $scope.vis.append("circle")
            .attr("transform", "translate(" + pos.x + "," + pos.y + ")")
            .attr("r", "45")
            .attr("class", "mainTopic");

        console.log("created main topic on " + pos.x + "," + pos.y );
    };

    /**
     * a tree need a main topic
     */
    this.createCenter = function($scope, $params){
        var circle = $scope.container.append("circle")
            //.attr("transform", "translate(" + $params.pos.x + "," + $params.pos.y + ")")
            .attr("r", "65")
            .attr("data-x", $params.pos.x)
            .attr("data-y", $params.pos.y)
            .attr("cx", function(d) { return $(this).attr('data-x'); })
            .attr("cy", function(d) { return $(this).attr('data-y'); })
            .attr("class", "mainTopic")
            //.call(drag);

        var text = circle.append('text')
            .attr('dx', $params.pos.x)
            .attr('dy',$params.pos.y)
            .text($scope.course.course)
            .attr("class", "mainTopicText");

        console.log("createCenter on " + $params.pos.x + "," + $params.pos.y );
    }

});

app.controller('TreeController', function($scope, $http, $attrs, TreeService, $animate) {
    var self = this;

    this.init = function(element, directiveScope){
        self.$element = element;
        $scope = directiveScope;

        console.log("init treecrontoller called");

        /**
         * to get basic data of a course
         */
        var parser = document.createElement('a');
        parser.href = $scope.currentUrl;
        var k = parser.pathname.split('/');
        $scope.courseId = k[k.length - 1];

        // get the course object
        $http.get('/api/catalogs/course/' + $scope.courseId).success(function (data) {
            $scope.course = data.course;

            // create the center circle for this course
            $scope.call('createCenter', {
                pos: {
                    x: (parseInt($scope.options.width)/2),
                    y: (parseInt($scope.options.height)/2)
                },
                text: $scope.course.course
            });
        });
    };



    $scope.$watch('course', function(newVal, oldVal){
        if(newVal != null){

        }
    });

    // reflection function, to call method on tree service by string
    $scope.call = function($methodName, $params){
        TreeService[$methodName]($scope, $params);
    };
});

/**
 * create rightclick menu, init dragging for svg container
 */
function initMapContainer(){
    var t = $('#map');
    $("#tree svg").each(function(i, svg) {
        $(svg).css({
            position: "relative",
            left: (t.width()/2) - ($(svg).width()/2),
            top:(t.height()/2) - ($(svg).height()/2)
        });
    });
}

function initDraggableUI(){
    var treeSVG = $('#treeSVG');
    /*
    // calculate containment
    var t = $("#tree");
    var wrapperOffset = t.offset();

    var containment = [
        t.width() - treeSVG.width() + wrapperOffset.left,
        $('#map').height() - treeSVG.height() + wrapperOffset.top,
        0,0
        //wrapperOffset.left + 5,
        //wrapperOffset.top

        //t.width() - treeSVG.width() + wrapperOffset.left,
        //$('#map').height() - treeSVG.height() + wrapperOffset.top,
    ];

    // enable canvas to be dragged along container
    treeSVG.draggable({
        containment: containment,
        drag: function(event) {
            //console.log($(this).css('top'));
        }
    });

    console.log(containment);
*/
    // enable rightclick open and close
    treeSVG.handleRightClick().handleLeftClick();
}