var request = require('request');
var fs = require('fs-extra');
var TreeNodes = require('./../../modules/trees/treeNodes.js');
var Resources = require('./../../modules/trees/resources.js');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var internalApiURL = "https://www3.elearning.rwth-aachen.de/_vti_bin/L2PServices/api.svc/v1/";
var externalApiURL = "https://www3.elearning.rwth-aachen.de/_vti_bin/L2PServices/externalapi.svc/";

var await = require('asyncawait/await');
var async = require('asyncawait/async');

function getUserRole(token,course_id,callback){
    url = internalApiURL+"viewUserRole?accessToken="+token+"&cid="+ course_id;

    request(url,function (error, response, body) {
        //Check for error
        if(error){
            return console.log('Error:', error);
        }

        //Check for right status code
        if(response.statusCode !== 200){
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var parsed = JSON.parse(body);

        callback(parsed.role);

    });

}

function getContext(token,callback){
    url = externalApiURL+"Context?token="+token;

    request(url,function (error, response, body) {
        //Check for error
        if(error){
            return console.log('Error:', error);
        }

        //Check for right status code
        if(response.statusCode !== 200){
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var parsed = JSON.parse(body);

        callback(parsed);

    });

}

function getLearningMaterials(token,course_id,callback){
    url = internalApiURL+"viewAllLearningMaterials?accessToken="+token+"&cid="+ course_id;

    request(url,function (error, response, body) {
        //Check for error
        if(error){
            return console.log('Error:', error);
        }


        //Check for right status code
        if(response.statusCode !== 200){
            return console.log('Invalid Status Code Returned:', response.statusCode);
        }

        var parsed = JSON.parse(body);
        var dataSet = parsed.dataSet
        var dataSet_filtered = []
        for (var i = 0; i < dataSet.length; i++){
            if (!dataSet[i].isDirectory){
                filename = dataSet[i].fileInformation.fileName;
                tokens = filename.split(".");
                if (tokens[tokens.length-1] == "pdf" || tokens[tokens.length-1] == "mp4" || tokens[tokens.length-1] == "webm"){
                    dataSet_filtered.push(dataSet[i])
                }

            }

        }

        callback(dataSet_filtered);


    });
}

function downloadLearningMaterials(token,course_id,cid_internal,dataSet, userid,callback){
    console.log("user id: "+userid);
    console.log("course_id: "+course_id);
    console.log("cid_internal: "+cid_internal);
    console.log("token: "+token);
    var dir = './temp';
    //console.log(userid);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    for (var j = 0; j < dataSet.length; j++){
      (function (i,last){
        if (!dataSet[i].isDirectory){
            filename = dataSet[i].fileInformation.fileName;
            console.log("File Name: "+filename)
            downloadUrl = dataSet[i].fileInformation.downloadUrl;
            is_root = false;
            if (dataSet[i].itemId == dataSet[i].parentFolderId){
                //doesn't have a parent folder
                is_root = true;
            } else {
                fullPath = dataSet[i].sourceDirectory;
                console.log("Full Path: "+fullPath);
                fullPath = fullPath.split("Lists/StructuredMaterials/")[1];
                folders = fullPath.split("/");



                var stuff = async(function (filename,folders) {
                        lastNode = null;
                        for (var j = 0; j < folders.length; j++){
                            current_folder = folders[j];
                            console.log('current folder: '+current_folder)

                            var node = await(TreeNodes.findOne({name: folders[j],courseId:cid_internal}).exec());

                            if(node){
                                console.log("tree node '"+ current_folder +"' found");
                            } else {
                                console.log("tree node '"+ current_folder +"' not found");
                                console.log('last node: '+lastNode);
                                node = await(addSubTopicNode(current_folder,userid,cid_internal,lastNode));
                                //console.log(node)
                            }

                            lastNode = node;


                        }
                        var node = await(TreeNodes.findOne({name: filename,courseId:cid_internal}).exec());
                        if (node){
                          console.log("content node: "+filename+" already exists")
                        } else {

                          parent = lastNode;

                          url = internalApiURL+"downloadFile/"+filename+"viewUserRole?accessToken="+token+"&cid="+ course_id+"&downloadUrl="+downloadUrl;

                          tokens = filename.split(".");
                          filetype = tokens[tokens.length-1]

                          filename =  await(addContentNode(filename, userid, cid_internal, parent,filetype));
                          //console.log("fname: "+content_node);
                          var ws = fs.createWriteStream("./public/"+filename);
                          ws.on('error', function(err) { console.log(err); });
                          request(url).pipe(ws);
                        }
                        
                        if (i == last){
                          callback();
                        }

                });

                
                stuff(filename,folders);
                
               
            
            }

        } else {
            //what to do with directories


        }
      })(j,dataSet.length-1);
    }
}

function generateRandomPos() {
  return Math.floor((Math.random() * 110) + 50);
}


function addContentNode(lName, lCreatedBy, lCourseId, lParent,lFileType){
  var node = {
    type: "contentNode",
    name: lName,
    createdBy: lCreatedBy,
    courseId: lCourseId,
    isDeleted: false
  };
  node.dateAdded= new Date();

  node.positionFromRoot = {
    x: generateRandomPos(),
    y: generateRandomPos()
  };
  var tn = new TreeNodes(node);
  await(tn.save());

  if(lParent!=null){
    var parentNode = await(TreeNodes.findOne({_id: lParent}).exec());
    parentNode.childrens.push(tn._id);
    await(parentNode.save());
    tn.parent = lParent;
    tn.positionFromRoot = {
      x: parentNode.positionFromRoot.x + generateRandomPos(),
      y: parentNode.positionFromRoot.y + generateRandomPos()
    };
  }
  var fName = "/resources/"+tn._id + "."+ lFileType;
  var Res = new Resources({
      type: lFileType,
      createdBy: lCreatedBy,
      link: fName,
      courseId: lCourseId,
      treeNodeId: tn._id
  });
  await(Res.save());


  await(
    TreeNodes.update({_id: tn._id}, {
      $addToSet: {
        resources: Res._id
      }
    }));

  await(tn.save());

  return fName;
}

function addSubTopicNode(lName, lCreatedBy, lCourseId, lParent){
  var node = {
    type: "subTopic",
    name: lName,
    createdBy: lCreatedBy,
    courseId: lCourseId,
    isDeleted: false
  };
  node.dateAdded= new Date();

  node.positionFromRoot = {
    x: generateRandomPos(),
    y: generateRandomPos()
  };
  var tn = new TreeNodes(node);
  await(tn.save());

  if(lParent!=null){
    var parentNode = await(TreeNodes.findOne({_id: lParent}).exec());
    parentNode.childrens.push(tn._id);
    await(parentNode.save());
    tn.parent = lParent;
    tn.positionFromRoot = {
      x: parentNode.positionFromRoot.x + generateRandomPos(),
      y: parentNode.positionFromRoot.y + generateRandomPos()
    };
  }

  return tn.save();
}



exports.getUserRole = getUserRole;
exports.getContext = getContext;
exports.getLearningMaterials = getLearningMaterials;
exports.downloadLearningMaterials = downloadLearningMaterials;


