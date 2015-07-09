
function initiateDraggableGrid() {
    var options = {
        cell_height: 400,
        vertical_margin: 10,
        resizable: false,
        allowed_grids: [0, 4, 8]
    };

    var curNode = {x:0, y:0};
    var $gs = $('.grid-stack');
    $gs.gridstack(options);

    $gs.on('onStartMove', function (e, node) {
        curNode.x = node.x;
        curNode.y = node.y;
    });

    $gs.on('onFinishDrop', function (e, node) {
        var o = $(node.el);
        if(options.allowed_grids.indexOf(node.x) < 0){
            o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
        }
        console.log("onFinishDrop");
    });

    $gs.on('onMove', function (e, node) {
        console.log(node.x + " ++ " + node.y);
    });
};
function handleTab(){
    var id = "preview";
    if (location.hash !== ''){
        var be = location.hash.split('?');
        if(be.length>1) {
            id = be[be.length - 1];
            $('a[data-target=#' + id + ']').tab('show');
        }
    }

    // add a hash to the URL when the user clicks on a tab
    $('a[data-toggle="tab"]').on('click', function(e) {
        history.pushState(null, null, $(this).attr('href'));
    });

    // navigate to a tab when the history changes
    window.addEventListener("popstate", function(e) {
        var activeTab = '';
        if (location.hash !== ''){
            var be = location.hash.split('?');
            id = be[be.length-1];
            activeTab = $('a[data-target=#' + id + ']');
        }

        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.nav-tabs a:first').tab('show');
        }
    });

    $(document).scrollTop(0);
}

