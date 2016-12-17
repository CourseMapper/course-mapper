
var og=require('og-parser');

function Ogp(){};


//get the ogdata description
Ogp.prototype.getOgDescription=function(url,callback){
    Ogp.prototype.getInfo(url,function(og_data){
       callback(og_data.og.description);
    });
};
//get the ogdata title
Ogp.prototype.getOgTitle=function(url,callback){
    Ogp.prototype.getInfo(url,function(og_data){
        callback(og_data.og.title);
    });
};
//get the ogdata image
Ogp.prototype.getOgImage=function(url,callback){
    Ogp.prototype.getInfo(url,function(og_data){
        callback(og_data.og.image);
    });
};

//retuen the og data-the og data contain the metadata and the og tag data
Ogp.prototype.getInfo=function(url,callback){
    //data initialization
    og(url, function(error, data) {
            if(error){
                console.log("inside error");
                data={};
                callback(data);
            }else{
                callback(data);
            }
        }
    );
};

module.exports=new Ogp();