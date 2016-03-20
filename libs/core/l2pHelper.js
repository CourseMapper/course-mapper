var request = require('request');
var fs = require('fs-extra');

var internalApiURL = "https://www3.elearning.rwth-aachen.de/_vti_bin/L2PServices/api.svc/v1/";
var externalApiURL = "https://www3.elearning.rwth-aachen.de/_vti_bin/L2PServices/externalapi.svc/";

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

function downloadLearningMaterials(token,course_id,dataSet,callback){
    var dir = './temp';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    for (var i = 0; i < dataSet.length; i++){
        if (!dataSet[i].isDirectory){
            filename = dataSet[i].fileInformation.fileName;
            downloadUrl = dataSet[i].fileInformation.downloadUrl;
            url = internalApiURL+"downloadFile/"+filename+"viewUserRole?accessToken="+token+"&cid="+ course_id+"&downloadUrl="+downloadUrl;

            var ws = fs.createWriteStream("./temp/"+filename);
            ws.on('error', function(err) { console.log(err); });
            request(url).pipe(ws);
        } else {
            //what to do with directories
        }

    }
    callback();
}

exports.getUserRole = getUserRole;
exports.getContext = getContext;
exports.getLearningMaterials = getLearningMaterials;
exports.downloadLearningMaterials = downloadLearningMaterials;
