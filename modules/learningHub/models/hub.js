var mongoose=require('mongoose');

var hubSchema= new mongoose.Schema();

var commentSchema=new mongoose.Schema();

var personalSchema= new mongoose.Schema();

personalSchema.add({

});

commentSchema.add({
    commentId:{type:mongoose.Schema.Types.ObjectId},
    userId:{type:Number},
    userName:{type:String},
    comment:{type:String},
    isDeleted:{type:Boolean},
    dateAdded:{type: Date},
    dateUpdated:{type: Date}

});

commentSchema.pre('save',function(next){
    var now =new Date();
    this.dateUpdated=now;
    if(!this.dateAdded){
        this.dateAdded=now;
    }
    next();
});


commentSchema.pre('update',function(next){
    var now=new Date();
    this.dateUpdated=now;
    next();
});

hubSchema.add({
    courseId:{type:Number, required: true},
    postId:{type: mongoose.Schema.Types.ObjectId},
    userId: {type: Number, required: true},
    title:{type:String,required: true},
    url:{type:String,required:true},
    type:{type:String,required:true},
    favicon:{type:String},
    hostName:{type:String},
    image:{type:String},
    embedHtml:{type:String},
    description:{type:String},
    isDeleted:{type: Boolean, required: true},
    dateAdded:{type: Date},
    dateUpdated:{type: Date},
    comments:[commentSchema],
    tags:[{type:String}]
});


hubSchema.pre('save',function(next){
    var now =new Date();
    this.dateUpdated=now;
    if(!this.dateAdded){
        this.dateAdded=now;
    }
    next();
});


hubSchema.pre('update',function(next){
    var now=new Date();
    this.dateUpdated=now;
    next();
});

var agg = {};
agg.posts=mongoose.model('hubSchema',hubSchema);
agg.personal = mongoose.model('personalSchema', personalSchema);
module.exports=agg;
