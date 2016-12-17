
var ahelper=require("./aggHelper.js");
var URL=require ('url-parse');
var h2js=require('html-to-json');

function Doc(){}

var oembed_list={
    'office':'https://mix.office.com/oembed',
    'docs':'https://docs.com/api/oembed'
};


//doc details
Doc.prototype.getDetails=function(url,host_name,callback){
    //init doc result
    var doc_result={
        'type':"doc",
        'url':"",
        'title':"",
        'html':""
    };
    doc_result.url=url;
    if(oembed_list[host_name]){
        ahelper.get(prepareoeURL(url, host_name),function(e,d){
            if(e){
                callback("invalid link",null);

            }else{
                doc_result.title=d.title;
                //doc_result.html=d.html;
                doc_result.html=prepareOeHtml(d.html,function(html){
                    doc_result.html=html;
                    callback(null,doc_result);
                });

            }
        });
    }

};
// prepare oe url
function prepareoeURL(url,host_name){
    return oembed_list[host_name]+'?url='+encodeURIComponent(url)+'&format=json';
};
// prepare protocol
function protocol(link){
    var url=new URL(link);
    return url.protocol;
};
//prepare the html iframe
function prepareOeHtml(ht,callback){
    h2js.parse(ht, {
        'src': function ($doc) {
            return $doc.find('iframe').attr('src');
        }
    }, function (err, slide_result) {
        if(err){
            console.log(err);
        }else{
            var html='<iframe src="'+slide_result.src+'" scrolling="no" frameborder="0" width="100%" height="500" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
            callback(html)
        }

    });

}

module.exports=new Doc();