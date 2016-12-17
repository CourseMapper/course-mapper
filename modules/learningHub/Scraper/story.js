/**
 * Created by Bharath on 07/04/16.
 */

var https=require("follow-redirects").https;
var http=require("follow-redirects").http;
var embedHtml=require('./embedHtml.js');
var ahelper=require("./aggHelper.js");
var ogp=require("./ogp.js");

//init story variable
function Story(){}
var oembed_list={
    'verse':'https://verse.media/services/oembed/',
    'amcharts':'https://live.amcharts.com/oembed/',
    'chartblocks':'https://embed.chartblocks.com/1.0/oembed',
    'repubhub':'http://repubhub.icopyright.net/oembed.act'
};

//get the story details
Story.prototype.getDetails=function(url,host_name,callback){
    //init the result story variable
    var story_result={
        'type':"story",
        'url':"",
        'title':"",
        'html':""
    };
    story_result.url=url;
    if(oembed_list[host_name]){
        ahelper.get(prepareoeURL(url, host_name),function(e,d){
            if(e){
                callback(e,null);
            }else{
                story_result.title=d.title;
                story_result.html=d.html;
                callback(null,story_result);
            }
        });
    }

};

function prepareoeURL(url,host_name){
    return oembed_list[host_name]+'?url='+encodeURIComponent(url)+'&format=json';
}


module.exports=new Story();