/**
 *
 * @returns {jQuery}
 */

(function ( $ ) {

    $.fn.handleRightClick = function() {
        this.on("contextmenu", function(event) {
            return false;
        });

        this.mousedown(function(event){
            // not right click, so go out quickly
            if(event.which != 3){
                return;
            }

            // show the right click menu
            $('#rightClick')
                .removeClass('hide')
                .addClass('show')
                .css("left", event.clientX).css("top", event.clientY)
                .on("contextmenu", function(event) {
                    //return false;
                });
        });

        // to be able jquery method chaining
        return this;
    };

    // left clicking on the screen.
    $.fn.handleLeftClick = function(){
        this.click(function(event){
            // hide the rightclick menu
            $('#rightClick').removeClass('show').addClass('hide');
        });

        // to be able jquery method chaining
        return this;
    };

}( jQuery ));

 