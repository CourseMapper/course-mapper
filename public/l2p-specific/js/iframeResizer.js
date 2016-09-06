window.onresize = function(){
    window.parent.postMessage(
    Math.max(600, 600,
        600, 600)
      ,"*");
      console.log("window resized");
 };

//Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
//    document.body.scrollHeight, document.body.offsetHeight)

window.onload = function() {
    window.parent.postMessage(
        Math.max(600, 600,
            600, 600)
        ,"*");
        console.log("window onload resized");
};

document.addEventListener('DOMContentLoaded', function() {
   window.parent.postMessage(
       Math.max(600, 600,
           600, 600)
     ,"*");
     console.log("document ready resized");
});
