
$(document).ready(function() {
    handleTab();

    courseTabResize();
    $(window, '#courseTabs').resize(function () {
        courseTabResize();
    });

    if (location.hash !== '')
        $(document).scrollTop(0);
});

function courseTabResize(){
    var ftr = $('.main-footer');
    var ctabs = $('#courseTabs');
    ctabs.css('min-height', parseInt($('.content-wrapper').css('min-height')) - $('.content-header').outerHeight() - ftr.outerHeight());
    $('#map').css('max-height', parseInt(ctabs.css('min-height'))
    - $('.box-header').outerHeight()
    - ftr.outerHeight() );
}

function handleTab(){
    if (location.hash !== '') $('a[href="' + location.hash + '"]').tab('show');

    // add a hash to the URL when the user clicks on a tab
    $('a[data-toggle="tab"]').on('click', function(e) {
        history.pushState(null, null, $(this).attr('href'));
    });
    // navigate to a tab when the history changes
    window.addEventListener("popstate", function(e) {
        var activeTab = $('[href=#preview]');
        if(location.hash)
            activeTab = $('[href=' + location.hash + ']');

        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.nav-tabs a:first').tab('show');
        }
    });

    $(document).scrollTop(0);
}

