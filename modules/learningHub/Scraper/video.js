
var https=require("follow-redirects").https;
var http=require("follow-redirects").http;
var ogp=require('./ogp.js');
var link=require("./link.js");
var ahelper=require("./aggHelper.js");
var h2js=require('html-to-json');
var ytCreditials={
    'API_URL':"https://www.googleapis.com/youtube/v3/videos?",
    'API_kEY':"AIzaSyCFIKbKuVsA0tuBdsx10xILXb5iXTakgoI"
};
var oembed_list={
    'vimeo':'https://vimeo.com/api/oembed.json',
    'dotsub':'https://dotsub.com/services/oembed',
    'ted':'https://www.ted.com/services/v1/oembed.json',
    'sapo':'https://videos.sapo.pt/oembed',
    'dailymotion':'https://www.dailymotion.com/services/oembed',
    'circuitlab':'https://www.circuitlab.com/circuit/oembed/',
    'coub':'https://coub.com/api/oembed.json',
    'kickstarter':'https://www.kickstarter.com/services/oembed'
};

//video prototype
function Video(){};
//get the video details
Video.prototype.getDetails=function(url,host_name,callback) {
    //init of the return variable
    var video_result={
        'type':"video",
        'url':"",
        'description':"",
        'title':"",
        'html':""
    };
    video_result.url = url;
    var prepared_url = "";
    //prepare the url
    if (oembed_list[host_name]) {
        prepared_url = prepareoeURL(url, host_name);
    } else if (host_name == 'youtube') {
        var ID = YouTubeGetID(url);
        prepared_url = prepareytURL(ID)
    }
    //use the helper to tget the JSON data
    ahelper.getHttps(prepared_url, function (e,d) {
        if(e){
            link.getInfo(url,function(res){
                callback(null,res);
            });

        }else{
            if (d =="") {
                link.getInfo(url,function(res){
                    callback(null,res);
                });

            } else {
                if (host_name === 'youtube') {
                    video_result.title = d.items[0].snippet.title;
                    video_result.description = d.items[0].snippet.description;
                    video_result.url = url.replace("watch?v=", "embed/");
                    video_result.html = prepareytHtml(url.replace("watch?v=", "embed/"));
                    callback(null,video_result);
                } else {
                    video_result.title = d.title;
                    video_result.html = d.html;
                    videoDescription(d, url, function (des) {
                        video_result.description = des;
                        callback(null, video_result);
                        //prepareHtml(video_result.html, video_result.description, function (html) {
                        //    video_result.html = html;
                        //    callback(null,video_result);
                        //});

                    });
                }

            }

        }

    });
};
//get the ID of the youTube video from its URL
function YouTubeGetID(url){
    var ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    }
    else {
        ID = url;
    }
    return ID;
}
//preparing youTube url
function prepareytURL(ID){
    var ytURL=ytCreditials.API_URL+"id="+ID+"&key="+ytCreditials.API_kEY+"&part=snippet";
    return ytURL;
}
//preparing oembed url
function prepareoeURL(url,host_name){
        return oembed_list[host_name]+'?url='+encodeURIComponent(url);
}
//prepare html for oembed video sites
function prepareHtml(ht,description,callback){
    h2js.parse(ht, {
        'src': function ($doc) {
            return $doc.find('iframe').attr('src');
        }
    }, function (err, video_result) {
        if(err){
            console.log(err);
            callback(ht);
        }else{
            var html='<iframe ng-src="'+video_result.src+'" width="100%" height=300px></iframe>';
            callback(html);
        }

    });

}
//get description
function videoDescription(d, url, callback){
    if (!d.description) {
        ogp.getOgDescription(url, function (des) {
            callback(des.replace(/(\r\n|\n|\r)/gm, ""))
        });
    }else
        {
            callback(d.description.replace(/(\r\n|\n|\r)/gm, ""));
        }
}

function prepareytHtml(url){
  return '<iframe src="'+url+'" width="100%" height=300px></iframe>';
};
module.exports= new Video();


