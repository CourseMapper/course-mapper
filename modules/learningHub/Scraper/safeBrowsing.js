
var https=require("https");
var sbCredentials={
    'API_kEY':"AIzaSyB_hxZ5n5YRD9nR7gCZUgscaDDv0R3N-bU"
};
/*SafeBrowsing lookup is used to check whether the submitted URl causes Phising, Malware or any unrelated software downloads*/
function SafeBrowsing(){}
//method used the API to get the results of the URL
SafeBrowsing.prototype.checkUrl=function(url,callback){
    https.get(preparesbUrl(url),function(response){

         var code=response.statusCode;
        if(code==200){
            callback(false);
        }else{
           callback(true);
        }
    })
};
//This method is used to prepare the submitted URL to get the results from API and compile to RFC 1738
function preparesbUrl(url){
    var encodedUrl=encodeURIComponent(url);
     return "https://sb-ssl.google.com/safebrowsing/api/lookup?client=LearningHub&key="+sbCredentials.API_kEY+"&appver=1.5.2&pver=3.1&url="+encodedUrl;
}
module.exports=new SafeBrowsing();


