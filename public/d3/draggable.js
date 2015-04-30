/**
 * draggable with translate, not change left / top with css
 * with transofrm.translate(x,y)
 *
 * @returns {jQuery}
 */

(function ( $ ) {
    $.fn.draggableTransform = function() {
        var clicked = false;
        var startPos = {};
        var finalPos = {x:0, y:0};

        this.mousedown(function(event){
            clicked = true;
            startPos = {x:event.clientX + finalPos.x, y: event.clientY + finalPos.y};
        });

        this.mousemove(function(event){
            if(!clicked)
                return;

            var X =  -1*( startPos.x - event.clientX);
            var Y =  -1*( startPos.y - event.clientY);
            finalPos = {x : X, y: Y};

            $(this).css('transform', 'translate(' + X + 'px, ' + Y + 'px)');
            console.log(X + " # Y:" + Y);
        });

        this.mouseup(function(event){
            clicked = false;
            console.log('mouseup');
        });

        this.mouseout(function(event){
            clicked = false;
            console.log('mouseout');
        });

        this.mouseleave(function(event){
            clicked = false;
            console.log('mouseleave');
        });

        // to be able jquery method chaining
        return this;
    };

}( jQuery ));
/*
limit top right:
top: 5px
left: -2200

limit top left:
left: 7
top: 1

limit bottom right;
top: -3340
left -2200

limit bottom left
top: - 3340
left: 5px

    */