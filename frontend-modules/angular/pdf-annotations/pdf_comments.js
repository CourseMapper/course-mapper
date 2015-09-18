app.controller('CommentListController', function($scope, $http, $rootScope, $sce, $timeout) {

    $scope.comment = {};

    $scope.submitComment = function (comment, resultVarName)
    {
      commentOnSubmit();
      var config = {
        params: {
          rawText: comment.rawText,
          author: $scope.currentUser.username,
          pageNumber: $scope.currentPageNumber,
          tagNames: comment.tagNames,
          tagRelPos: comment.tagRelPos,
          tagRelCoord: comment.tagRelCoord,
          tagColor: comment.tagColor
        }
      };

      $http.post("/slide-viewer/submitComment/", null, config)
        .success(function (data, status, headers, config)
        {
          $scope[resultVarName] = data;
        })
        .error(function (data, status, headers, config)
        {
          $scope[resultVarName] = "SUBMIT ERROR";
        });
    };


    $scope.currentUser = "";
    $rootScope.$watch('user', function(){
          if($rootScope.user) {
              $scope.currentUser = $rootScope.user;
          }
      });


    $scope.orderType = "author";
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = '';
    //$scope.pageFilter;


    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;


    function updateScope(url){
      $http.get(url).success(function (data) {
        //console.log('COMMENTS UPDATED');
        //console.log("url: " + url);

        $scope.comments = data.comments;

        for(var i in $scope.comments){
          var cmnt = $scope.comments[i];
          cmnt.html = $sce.trustAsHtml(cmnt.html);

          $timeout(function(){
            $scope.$apply();
            commentsLoaded();
          });
        };
      });
    };

    function getCurrentFilters(filtersRaw){
      var finalFilters;
      /*if($scope.filtersRaw.length == 0)
        finalFilters='{}';
      else {*/
        var filterStrings = $scope.filtersRaw.split(';');
        //console.log("FOUND RAW FILTERS: " + $scope.filtersRaw);
        finalFilters = '{';
        if(filterStrings.length >= 1) if(filterStrings[0]!=""){

          for(var i=0; i < filterStrings.length; i++){
            //console.log("APPLIED A FILTER");
            var temp = filterStrings[i].split(',');
            if(temp.length != 1)
              finalFilters = finalFilters + '"' + temp[0] + '":"' + temp[1] + '"';
            else
            {
              temp = filterStrings[i].split(':');
              if(typeof temp[1] != 'undefined') {
                if(temp[1].charAt(0) == "#")
                  finalFilters = finalFilters + '"' + temp[0] + '":{"regex_hash": "' + temp[1].substring(1) + '"}';
                else {
                  finalFilters = finalFilters + '"' + temp[0] + '":{"regex": "' + temp[1].substring(1) + '"}';
                }
              }
            }


            //if(i != filterStrings.length-1)
            finalFilters = finalFilters + ',';
          }
        }
        if(!isNaN($scope.currentPageNumber))
          finalFilters = finalFilters + '"pdfPageNumber":"' + $scope.currentPageNumber + '"';
        finalFilters = finalFilters + '}';

      //}
      //console.log("Final Filters: " + finalFilters);
      return finalFilters;
    }


    $scope.$watch("orderType",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("ascending",function(newValue,oldValue){
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("filtersRaw",function(newValue,oldValue){
      //console.log("NOTICED FILTERS CHANGE");
      $scope.filters = getCurrentFilters($scope.filtersRaw);
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      //console.log("commentGetUrl: " + $scope.commentGetUrl);
      updateScope($scope.commentGetUrl);
    });

    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      $scope.filters = getCurrentFilters($scope.filtersRaw);
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
      //console.log("commentGetUrl: " + $scope.commentGetUrl);
      updateScope($scope.commentGetUrl);
    });





    /*$http.get('/slide-viewer/disComm').success(function (data) {
        console.log(data);
        $scope.comments = data.comments;

        for(var i in $scope.comments){
            var cmnt = $scope.comments[i];
            cmnt.html = $sce.trustAsHtml(cmnt.html);
        }


        $scope.loadComments = function (orderType, ascending, filters) {
          //var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/' + filters;
          var url = '/slide-viewer/disComm/{"type":"'+ orderType + '","ascending":"' + ascending + '"}/{"author":"Kaet"}';
          console.log(url);
          $http.get(url).success(function (data) {
              console.log(data);
              $scope.comments = data.comments;

              for(var i in $scope.comments){
                  var cmnt = $scope.comments[i];
                  cmnt.html = $sce.trustAsHtml(cmnt.html);
              }

          });




        };
    });*/

});
