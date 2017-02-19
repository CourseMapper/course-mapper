
var URL=require ('url-parse');
var isImageUrl = require('is-image-url');
var video=require('./video.js');
var slide=require('./slide.js');
var image=require('./image.js');
var link1=require('./link.js');
var audio=require('./audio.js');
var domain=require('domain');
var request=require('request');
var sb=require('./safeBrowsing.js');
var story=require('./story.js');
var pdf=require('./pdf.js');
var doc=require('./doc.js');
require('follow-redirects').maxRedirects = 10;
var https=require("follow-redirects").https;
var http=require("follow-redirects").http;
var current_link="";
var videos=['youtube','vimeo','dotsub','ted','sapo','dailymotion','circuitlab','coub','kickstarter'];
var slides=['slideshare','speakerdeck','sway','slides','emaze'];
var images=['flickr','flic','smugmug','23hq','hlip','germany','geograph','infogram','chartblocks','infogr'];
var stories=['silk','verse','amcharts'];
var audios=[,'soundcloud','mixcloud','clyp','huffduffer'];
var docs=['docs','office'];

var d=domain.create();

function scrape(){}
function hostName(link){
    var url=new URL(link);
    return url.hostname;
}

function protocol(link){
    var url=new URL(link);
    return url.protocol;
}

d.on("error",function(){
    console.log("exit");
});
d.run(scrape.prototype.getInfo=function(link,callback){
    request.get(link)
        .on('response',function(response){
            if(response.statusCode >=401){
                var err="Invalid link";
                callback(err,null);
            }
            else{
                check_url(link,function(legit){
                    if(legit){
                        var host_name=hostName(link);
                        if(contains(videos,host_name)){
                            video.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(contains(slides,host_name)){
                            slide.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(contains(images,host_name)){

                            image.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(isImageUrl(link)){

                            image.getDetails(link,host_name,
                                function(res){
                                    callback(null,res);
                                });
                        }else if(contains(stories,host_name)){
                            story.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(contains(audios,host_name)){

                            audio.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(contains(docs,host_name)){
                            doc.getDetails(link,current_link,
                                function(err,res){
                                    callback(err,res);
                                });
                        }else if(isPdf(link,function(valid){
                                if(valid){
                                    pdf.getInfo(link,function(res){
                                        console.log("found pdf");
                                        callback(null,res);
                                    })
                                }
                                else{
                                    link1.getInfo(link,function(err,res){
                                        callback(err,res);
                                    })
                                }
                            })){
                        }
                    }
                    else{
                        console.log(legit);
                    }
                });
            }
        }).on("error",function(err){
        console.log("inside error");
        console.log(err);
        var err="Invalid link";
        callback(err,null);
    });
});

function contains(list,hostname) {
    for (var i = 0; i < list.length; i++) {
        var sub_str=list[i];
        if(hostname.indexOf(sub_str)>-1){
            current_link=list[i];
            return true;
        }
    }
    return false;
}
function check_url(link,callback){

    sb.checkUrl(link,function(legit){

        callback(legit);
    });
}

function isPdf(url,callback){
    var proto=protocol(url);
    if(proto=="http:"){
        http.get(url,function(res,err){

            if(err){
                callback(false);
            }

            if(res.headers['content-type']=='application/pdf'){
                callback(true);

            }else{

                callback(false);
            }
        });
    }else{
        https.get(url,function(res,err){

            if(err){
                console.log(err);
            }
            if(res.headers['content-type']=='application/pdf'){
                callback(true);
            }else{

                callback(false);
            }
        });
    }

}
module.exports= new scrape();





