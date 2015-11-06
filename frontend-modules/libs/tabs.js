/**
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

function toggleTabMenu(){
    var drw = $('.draw-tab');
    if(!drw.hasClass('draw-tab-show')){
        drw.addClass('draw-tab-show');
    } else {
        drw.removeClass('draw-tab-show');
    }
}
function hideTabMenu(){
    $('.draw-tab').removeClass('draw-tab-show');
}