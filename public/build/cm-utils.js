
/**
 * encode uri component for post request parameter
 *
 * @param obj
 * @returns {string}
 */
function transformRequest(obj) {
    var str = [];
    for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
}

function arrayObjectIndexOf(myArray, searchObj, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchObj[property])
            return i;
    }
    return -1;
}

function removeObjectFromArray(myArray, searchObj, property){
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchObj[property]){
            myArray.splice(i, 1);
            return;
        }
    }
}

/**
 * https://scotch.io/quick-tips/how-to-encode-and-decode-strings-with-base64-in-javascript
 * @type {{_keyStr: string, encode: Function, decode: Function, _utf8_encode: Function, _utf8_decode: Function}}
 */
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

function cloneSimpleObject(obj){
    return JSON.parse(JSON.stringify(obj));
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