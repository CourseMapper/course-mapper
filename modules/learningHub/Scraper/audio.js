
var https=require("follow-redirects").https;
var http=require("follow-redirects").http;
var ogp=require("./ogp.js");
var ahelper=require("./aggHelper.js");
var embed=require("./embedHtml.js");

function Audio(){}
var oembed_list={
    'soundcloud':'http://soundcloud.com/oembed',
    'mixcloud':'https://www.mixcloud.com/oembed/',
    'clyp':'https://api.clyp.it/oembed/',
    'huffduffer':'https://huffduffer.com/oembed'

};

//audio details
Audio.prototype.getDetails=function(url,host_name,callback){
    //init the return varible
    var audio_result={
        'type':"audio",
        'url':"",
        'title':"",
        'html':""
    };
    audio_result.url=url;
    if(oembed_list[host_name]){
        ahelper.get(prepareoeURL(url, host_name),function(e,d){
            if(e){
                callback(e,null);
            }else{
                audio_result.title=d.title;
                audio_result.html=d.html;
                callback(null,audio_result);
            }


        });
    }

};

//prepare audio oe url
function prepareoeURL(url,host_name){
    return oembed_list[host_name]+'?url='+encodeURIComponent(url)+'&format=json';
}


module.exports=new Audio();

