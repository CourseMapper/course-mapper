
function handleTab(){
    var id = "preview";
    if (location.hash !== ''){
        var be = location.hash.split('?');
        if(be.length>1) {
            id = be[be.length - 1];
            $('a[data-target=#' + id + ']').tab('show');
        }
    }

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

