/**
 * troller to handle the form for scraping and adding posts
 */
learningHubModule.controller("hubaddLinkController",[ '$rootScope','$scope', '$http', '$window', function ($rootScope, $scope, $http, $window){
    $scope.loading=false;
    $scope.scraped=true;
    $scope.courseId=001;
    $scope.formData={
        'url':"",
        'title':"",
        'type': "",
        'description':"",
        'tags':[],
        'userId' : 1,
        "html" : "",
        "image":"",
        "favicon":"",
        "hostName":""
    };
    $scope.unformattedtags = [];

    /**
     * funciton to scrape the link
     * @param isValid
     * @param form
     */
    $scope.scrapelink=function(isValid,form){
        if(isValid){
            $scope.loading=true;
            $http.get('/api/learningHub/scrape', {params:{
                'url':$scope.formData.url
            }}).success( function (data)  {
                //check data for error
                if(data=="invalid link"){
                    $scope.loading=false;
                    form.$setPristine(true);
                    $scope.linkInvalid=true;
                }else{
                    console.log(data);
                    $scope.linkInvalid=false;
                    $scope.formData.url = data.url;
                    if(data.type){
                        $scope.formData.type = data.type;
                    }
                    if(data.title){
                        $scope.formData.title=data.title;
                    }
                    if(data.description){
                        $scope.formData.description=$scope.descriptionValid(data.description);
                    }
                    //show or hide description
                    if(data.type==="image" || data.type==="audio" || data.type==="slide" || data.type==="doc" || data.type==="pdf" || data.type==="story"){
                        $scope.des_hide=true;
                    }else{
                        $scope.des_hide=false;
                    }

                    if(data.html){
                        $scope.formData.html = data.html;
                    }
                    if(data.image){
                        $scope.formData.image = data.image;
                    }
                    if(data.name){
                        $scope.formData.hostName = data.name;
                    }
                    if(data.favicon){
                        $scope.formData.favicon = data.favicon;
                    }

                    //end loading and show the form
                    $scope.loading=false;
                    $scope.scraped=false;
                }
            }).error( function (data) {
                $scope.loading=false;
                console.log(data);
            });
        }

    };

    //util methods
    $scope.descriptionValid=function(description){
        if(description.length>700){
            return description.slice(0,600)+"...";
        }else{
            return description;
        }
    };

    /**
     * function to reset the form
     */
    $scope.reset=function(form1,form2){
        $scope.formData={
            'url':"",
            'title':"",
            'type': "",
            'description':"",
            'tags':[],
            'userId' : 1,
            "html" : ""
        };
        form1.$setPristine(true);
        form2.$setPristine(true);
        $scope.scraped=true;

    };

    /**
     *function to add the scraped link to the database
     * @param isValid
     */
    $scope.add= function (isValid) {

        if($scope.unformattedtags) {
            $scope.formData.tags = $scope.validTags($scope.unformattedtags);
        }

        if (!$scope.des_hide) {
            $scope.formData.description=$scope.descriptionValid($scope.formData.description);
        }
        console.log($scope.formData);
        $http.post('/api/learningHub/add/'+ $scope.treeNode._id,$scope.formData).success(function (data){
            $scope.unformattedtags="";
            $scope.des_hide=false;
            $scope.scraped=true;
            $scope.$emit('LinkForm', {
                formAction : "newPost"
            });
            $('#Hubaddlink').modal('hide');
        }).error( function(err){
            console.log(err);
            $scope.reset();
            $('#Hubaddlink').modal('hide');
        });

        $scope.reset($scope.aggregateData,$scope.aggregateUrl);
    };

    /**
     *
     * @param unformattedTags
     * @returns {Array|*}
     */
    $scope.validTags=function(unformattedTags){
        var formattedTags = [];
        Object.keys(unformattedTags).forEach(function(tag){
            formattedTags.push(unformattedTags[tag].text)
        });
        return formattedTags;
    };

    $scope.closeForm = function(){
        $scope.formData.url = '';
        $scope.loading = false;
        $('#Hubaddlink').modal('hide');
    }

}]);


