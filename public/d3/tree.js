var m = [20, 120, 20, 120];
var i = 0;
var root;

function createTree(elName, width, height) {

    var vis = d3.select(elName).append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "treeSVG");
        //.append("svg:g")
        //.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    jQuery('#treeSVG');
}

function courseTabResize(){
    jQuery('#courseTabs').css('min-height', parseInt(jQuery('.content-wrapper').css('min-height')) - jQuery('.content-header').outerHeight() - jQuery('.main-footer').outerHeight());
    jQuery('#map').css('max-height', parseInt(jQuery('#courseTabs').css('min-height'))
    - jQuery('.box-header').outerHeight()
    - jQuery('.main-footer').outerHeight() );
}

jQuery(window, '#courseTabs').resize(function () {
    courseTabResize();
});

jQuery(document).ready(function(){
    courseTabResize();

    var elName = '#tree';
    var w = jQuery('.tab-content').width() - jQuery('.nav-tabs').outerWidth();
    var h = jQuery('#courseTabs').height();

    w = 4000;
    h = 4000;

    createTree(elName, w, h);
});
