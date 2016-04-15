window.onresize = function(){
    window.parent.postMessage(
    Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
              document.body.scrollHeight, document.body.offsetHeight)
      ,"*");
      console.log("window resized");
 };

window.onload = function() {
    window.parent.postMessage(
        Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
                document.body.scrollHeight, document.body.offsetHeight)
        ,"*");
        console.log("window onload resized");
};

document.addEventListener('DOMContentLoaded', function() {
   window.parent.postMessage(
   Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight,
             document.body.scrollHeight, document.body.offsetHeight)
     ,"*");
     console.log("document ready resized");
});
