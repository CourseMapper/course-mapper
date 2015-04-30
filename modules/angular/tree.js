/**
 * to use this, create an element <cm-tree></cm-tree>
 */
app.directive('cmTree', function($timeout){

    /**
     * constructor of cm-tree
     */
    function link($scope, $element, $attrs, $ctrl){
        /**
         * d3 tree main object
         */
        $scope.vis = d3.select($element[0]).append("svg:svg")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .attr("id", $attrs.el)
            .on("mousemove", function(){
                // Extract the click location
                var point = d3.mouse(this);
                $scope.mousePosition = {x: point[0], y: point[1] };
                console.log(point[0] + " -- " + point[1]);
            });
            /*.on("contextmenu", function(data, index) {
                //handle right click
                Menu.showMenu({pageX: $scope.mousePosition.x, pageY:$scope.mousePosition.y});

                //stop showing browser menu
                d3.event.preventDefault();
            })
            .on("click", function(){
                Menu.closeMenu();
            });*/

        $scope.options = $attrs;

        $ctrl.init($element, $scope);
    }

    var drag = d3.behavior.drag()
        .on("drag", dragmove);

    function dragmove(d) {
        var x = d3.event.x;
        var y = d3.event.y;
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    /**
     * when the svg has finished loading
     */
    $timeout(function () {
        initDraggableUI();
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
    }

});

app.controller('TreeController', function($scope, $attrs, TreeService, $animate) {
    var self = this;

    this.init = function(element, directiveScope){
        self.$element = element;
        $scope = directiveScope;
        console.log("init treecrontoller called");
    };

    $scope.call = function($methodName, $params){
        TreeService[$methodName]($scope, $params);
    };
});

/**
 * create rightclick menu, init dragging for svg container
 */
function initDraggableUI(){
    var treeSVG = $('#treeSVG');

    // calculate containment
    var t = $("#tree");
    var wrapperOffset = t.offset();

    var containment = [
        t.width() - treeSVG.width() + wrapperOffset.left,
        $('#map').height() - treeSVG.height() + wrapperOffset.top,
        wrapperOffset.left + 5,
        wrapperOffset.top
    ];

    // enable canvas to be dragged along container
    treeSVG.draggable({
        containment: containment,
        drag: function(event) {
            //console.log($(this).css('top'));
        }
    });

    // enable rightclick open and close
    treeSVG.handleRightClick().handleLeftClick();

    console.log(containment);
}