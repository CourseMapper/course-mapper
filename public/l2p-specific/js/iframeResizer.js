window.onresize = function(){
             window.parent.postMessage(
            Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
                    document.body.scrollHeight, document.body.offsetHeight)
            ,"*")
       };

    window.onload = function() {
        window.parent.postMessage(
            Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
                    document.body.scrollHeight, document.body.offsetHeight)
            ,"*");
    };
