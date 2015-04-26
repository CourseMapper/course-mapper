/**
 * handle right click
 * this will open a menu with right click
 *
 * create a div with id rightClick that contains the menu/html element
 *
 * this will also close this menu once the left menu is clicked everywhere on the screen
 *
 * @returns {jQuery}
 */

(function ( $ ) {

    var Menu = {
        showMenu : function(event, show, shown){
            var el = $('#rightClick');

            // execute before show callback
            if(show) show(event, el);

            // show the right click menu
              el.removeClass('hide')
                .addClass('show')
                .css("left", event.pageX).css("top", event.pageY)
                .on("contextmenu", function(event) {
                    //return false;
                });

            // execute after shown callback
            if(shown) shown(event, el);
        },

        closeMenu: function(event, close, closed){
            var el = $('#rightClick');

            // execute before show callback
            if(close) close(event, el);

            // hide the rightclick menu
            el.removeClass('show').addClass('hide');

            // execute after shown callback
            if(closed) closed(event, el);
        }
    };

    $.fn.handleRightClick = function(show, shown) {
        this.on("contextmenu", function(event) {
            return false;
        });

        this.mousedown(function(event){
            // not right click, so go out quickly
            if(event.which != 3){
                return;
            }

            console.log(event.clientX + " - y:" + event.clientY);

            // show the right click menu
            Menu.showMenu(event, show, shown);
        });

        // to be able jquery method chaining
        return this;
    };

    // left clicking on the screen.
    $.fn.handleLeftClick = function(close, closed){
        this.click(function(event){
            Menu.closeMenu(event, close, closed);
        });

        // to be able jquery method chaining
        return this;
    };

}( jQuery ));

 