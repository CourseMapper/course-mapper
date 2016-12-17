
var meta = require('metatags');
function Meta(){};


Meta.prototype.getTitle=function(url,callback){
    Meta.prototype.getInfo(url,function(meta_data){
        if(meta_data.title){
            callback(meta_data.title);
        }else{
            callback("");
        }

    });

};

Meta.prototype.getDescription=function(url,callback){
    Meta.prototype.getInfo(url,function(meta_data){
        if(meta_data.description){
            callback(meta_data.description);
        }else{
            callback("");
        }
    });

};
Meta.prototype.getImage=function(url,callback){
    Meta.prototype.getInfo(url,function(meta_data){
        if(meta_data.image){
            callback(meta_data.image);
        }else{
            callback("");
        }

    });

};

Meta.prototype.getInfo=function(url,callback){
    var meta_data={};
    meta(url,function(err,data){
        //console.log(data);
        if(err){
            callback(meta_data);
        }else{
            callback(data);
        }

    });
};

module.exports=new Meta();
