var rootpath=require('app-root-path');
var mongoose=require('mongoose');
var agg=require('./models/hub.js');
var personalspace  = agg.personal;
var posts = agg.posts;
var scrape=require(rootpath+'/public/build/learningHub.js');

function hubcontroller(){

}
//scrape the content
hubcontroller.prototype.scrape=function(url,callback){

    scrape.getInfo(url,function(error,res){
        if(error){
            callback(error,null);
        }else{
            callback(null,res);
        }
    });
};

hubcontroller.prototype.add=function(error,params,success){
    console.log(params);
    var newPost=new posts({
        courseId:002,
        postId:new mongoose.Types.ObjectId,
        userId:params.userId,
        title:params.title,
        url:params.url,
        type:params.type,
        favicon: params.favicon ? params.favicon : null,
        hostName: params.hostName ? params.hostName : null,
        image: params.image ? params.image : null,
        embedHtml: params.html ? params.html : null,
        description:params.description ? params.description : null,
        isDeleted:false,
        tags:params.tags
    });

    newPost.save(function(err){
        if(err){
            error(err);
            return;

        }else{
            success(newPost);
        }
    })

};

hubcontroller.prototype.search  = function(query, success, error){
    var searchQuery = '/^' + query + '/i';
    posts.find({
            isDeleted : false,
            $text : {
                $search : query
            }
        }
    ).sort({'dateAdded':-1}).exec(function(err,posts){
        if(err){
            console.log(err);
            error(err);
            return;
        }else{
            success(posts);
            return;
        }
    })
};

hubcontroller.prototype.personalAdd=function(error,params,success){
    console.log(params);
    var newPost=new personalspace({
        courseId:002,
        postId:new mongoose.Types.ObjectId,
        userId:params.userId,
        title:params.title,
        url:params.url,
        type:params.type,
        favicon: params.favicon ? params.favicon : null,
        hostName: params.hostName ? params.hostName : null,
        image: params.image ? params.image : null,
        embedHtml: params.html ? params.html : null,
        description:params.description ? params.description : null,
        isDeleted:false,
        tags:params.tags
    });

    newPost.save(function(err){
        if(err){
            error(err);
            return;

        }else{
            success(newPost);
        }
    })

};

hubcontroller.prototype.delete = function(query, success, error){

    posts.update(
        {
            postId: query.postId
        },{
            $set:{
                "isDeleted" : true
            }
        }, function(err){
            if(err){
                error(err);
            }else{
                success("deleted");
            }
        }
    )
};

hubcontroller.prototype.edit = function(body, success, error){
    console.log(body);
    posts.update(
        {
            postId: body.postId
        },{
            $set:{
                "title" : body.title,
                "description": body.description,
                "tags":body.tags
            }
        }, function(err){
            if(err){
                error(err);
            }else{
                success("edited");
            }
        }
    )
};

hubcontroller.prototype.comment=function(error,params,success){
    agg.update(
        {
            postId:params.postId
        },
        {
            $push:{
                "comments":{
                    "commentId":new mongoose.Types.ObjectId,
                    "userId":params.userId,
                    "isDeleted":false,
                    "comment":params.content,
                    "userName":params.userName
                }


            }
        },
        function(err){
            if(err){
                error(err);
            } else{
                success();
            }
        }
    )

};


hubcontroller.prototype.getlinks=function(error,params,success){
    var dateSort = params.sortBy == "newest" ? -1 : 1;
    console.log(params.sortBy+""+dateSort);
    if(params.type == 'all'){
        posts.find({courseId:params.courseId, isDeleted: false}).sort({'dateAdded': dateSort}).exec(function(error,posts){
            if(error){
                error(error);
                return;
            }else{
                success(posts);
                return;
            }
        })
    }else{
        posts.find({courseId:params.courseId, isDeleted: false, type : params.type}).sort({'dateAdded': dateSort}).exec(function(error,posts){
            if(error){
                error(error);
                return;
            }else{
                success(posts);
                return;
            }
        })
    }



};

module.exports=new hubcontroller();
