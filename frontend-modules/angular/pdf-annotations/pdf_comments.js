app.controller('CommentListController', function($scope, $http, $rootScope, $sce, $timeout) {

    $scope.comment = {};

    $scope.submitComment = function (comment, resultVarName)
    $scope.orderType = false;
    $scope.orderBy = false;
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = '';

    $scope.orderingOptions = [
        {id: 'dateOfCreation.descending', name: 'Newest First'},
        {id: 'dateOfCreation.ascending', name: 'Oldest First'},
        {id: 'author.descending', name: 'Author (descending)'},
        {id: 'author.ascending', name: 'Author (ascending)'}
        //todo: {id: 'relevance', name: 'Relevance'}
    ];

    $scope.submitData = function (comment, resultVarName)
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
          updateScope($scope.commentGetUrl);
          $scope[resultVarName] = data;

          var comment = $scope.comment;

          comment.rawText = '',
          comment.tagNames = '',
          comment.tagRelPos = '',
          comment.tagRelCoord = '',
          comment.tagColor = ''

        })
        .error(function (data, status, headers, config)
        {
          console.log("SUBMIT ERROR");
        });
    };


    $scope.currentUser = "";
    $rootScope.$watch('user', function(){
          if($rootScope.user) {
              $scope.currentUser = $rootScope.user;
          }
      });

    //$scope.pageFilter;


    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;


    function updateScope(url){
      $http.get(url).success(function (data) {
        //console.log('COMMENTS UPDATED');
        //console.log("url: " + url);

        $scope.comments = data.comments;

        for(var i in $scope.comments){
          var cmnt = $scope.comments[i];
          //cmnt.html = $sce.trustAsHtml(cmnt.html);

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

    $scope.parseOrderType = function(orderType){
        var orderSplit = orderType.split('.');
        $scope.orderBy = orderSplit[0];
        if(orderSplit[1]) {
            $scope.ascending = (orderSplit[1] == 'ascending') ? true : false;
        } else
            $scope.ascending = false;
    };

    $scope.getComment = function(orderType){
        $scope.parseOrderType(orderType);

        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        updateScope($scope.commentGetUrl);
    };

    $scope.init = function(){
        $scope.getComment($scope.orderingOptions[0].id);
    };

    $scope.init();

    $scope.$watch("orderType",function(newValue,oldValue){
        if(newValue !== oldValue) {
            $scope.orderType = newValue;
            $scope.getComment(newValue.id);
        }
    });

    $scope.$watch("filtersRaw",function(newValue,oldValue){
        if(newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            //console.log("NOTICED FILTERS CHANGE");
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            updateScope($scope.commentGetUrl);
        }
    });

    $scope.$watch("currentPageNumber",function(newValue,oldValue){
        if(newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            updateScope($scope.commentGetUrl);
        }
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
