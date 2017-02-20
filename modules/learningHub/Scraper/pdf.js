
var google_viewer="https://drive.google.com/viewerng/viewer?url=";
var meta = require('metatags');

function Pdf(){}

var pdf_result={
    'type':"pdf",
    'url':"",
    'title':""
};

Pdf.prototype.getInfo=function(url,callback){
    pdf_result.url=google_viewer + encodeURI(url) + '&embedded=true';
    meta(pdf_result.url, function(err, data){
        if(err){
            callback(err,null);
        }else{
            pdf_result.title=data.title;
            callback(pdf_result);
        }
    });

};

module.exports=new Pdf();