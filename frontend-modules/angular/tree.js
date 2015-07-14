/**
 * to use this, create an element <cm-tree></cm-tree>
 */
app.directive('cmTree', function($timeout){
    /**
     * option parameter
     * @type {{width: number, height: number}}

    this.options = {
        width : 0,
        height : 0
    };*/


    /**
     * d3 tree main object
     */
    this.vis = {};

    /**
     * constructor of cm-tree
     */
    function link($scope, $el, $attr){

        $scope.vis = d3.select($el[0]).append("svg:svg")
            .attr("width", $attr.width)
            .attr("height", $attr.height)
            .attr("on-finish-render", "initDraggableUI")
            .attr("id", $attr.el);

        createMainTopic($scope, $el, $attr);

        $scope.options = $attr;
    }

    /**
     * a tree need a main topic
     */
    function createMainTopic($scope, $el, $attr){
        var pos = {x:300, y:300};
        $scope.vis.append("circle")
            .attr("transform", "translate(" + pos.x + "," + pos.y + ")")
            .attr("r", "45")
            .attr("class", "mainTopic");
    }

    var drag = d3.behavior.drag()
        .on("drag", dragmove);

    function dragmove(d) {
        var x = d3.event.x;
        var y = d3.event.y;
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    $timeout(function () {
        //DOM has finished rendering
        initDraggableUI();
    });

    return {
        link: link,
        restrict: 'E'
    }
});