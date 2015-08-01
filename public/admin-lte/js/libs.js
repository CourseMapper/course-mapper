
function initiateDraggableGrid(locs) {
    var options = {
        cell_height: 340,
        vertical_margin: 10,
        resizable: false,
        //allowed_grids: [0, 4, 8]
    };

    var curNode = {x:0, y:0};
    for(var i in locs){
        var loc = locs[i];

        var $gs = $(loc);
        $gs.gridstack(options);

        $gs.on('onStartMove', function (e, node) {
            curNode.x = node.x;
            curNode.y = node.y;
        });

        $gs.on('onFinishDrop', function (e, node) {
            var o = $(node.el);
            if(options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0){
                o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
            }
            console.log("onFinishDrop");
        });

        $gs.on('onMove', function (e, node) {
            console.log(node.x + " ++ " + node.y);
        });
    }
};/**
 * parse url parameter / query parameter in the url
 * @param url string
 * @returns {} dictionary
 * @constructor
 */
function ParseQuery(url){
    var ret = {};
    var b = url.split('?');

    if(b.length > 0){
        var q = b[1];
        if(q) {
            var ps = q.split('&');
            for (var i in ps) {
                var p = ps[i];
                var te = p.split('=');
                if (te.length > 0) {
                    var k = te[0];
                    var v = te[1];
                    ret[k] = v;
                }
                else {
                    var k = p;
                    ret[k] = false;
                }
            }
        }
    }

    return ret;
}

function handleTab(){
    var id = "preview";

    if (location.hash !== ''){
        var params = ParseQuery(location.hash);
        if(params['tab']) {
            id = params['tab'];
        }

        $('a[data-target=#' + id + ']').tab('show');
    }

    // navigate to a tab when the history changes
    window.addEventListener("popstate", function(e) {
        var activeTab = '';
        if (location.hash !== ''){
            var params = ParseQuery(location.hash);
            var be = params['tab'];
            activeTab = $('a[data-target=#' + be + ']');
        }

        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.nav-tabs a:first').tab('show');
        }
    });

    $(document).scrollTop(0);
}

