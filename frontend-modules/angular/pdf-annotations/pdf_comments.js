app.controller('CommentListController', function($scope, $http, $rootScope, $sce, $timeout) {

    $scope.comment = {};

    $scope.orderType = false;
    $scope.orderBy = false;
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = {};
    $scope.currentPageNumber = 1;


    $rootScope.$on('onPdfPageChange', function(e, newSlideNumber){
        $scope.currentPageNumber = newSlideNumber;
    });

    $scope.orderingOptions = [
        {id: 'dateOfCreation.descending', name: 'Newest First'},
        {id: 'dateOfCreation.ascending', name: 'Oldest First'},
        {id: 'author.descending', name: 'Author (descending)'},
        {id: 'author.ascending', name: 'Author (ascending)'}
        //todo: {id: 'relevance', name: 'Relevance'}
    ];

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

    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;

    $scope.switchRegexFilter = function(value){
        $scope.filtersRaw['renderedText'] = {'regex': value};

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.switchRegexHashFilter = function(value){
        $scope.filtersRaw['renderedText'] = {'regex_hash': value.substring(1)};
        console.log($scope.filtersRaw);

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.authorLabelClick = function(authorName){
        $scope.filtersRaw['author'] = authorName;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.commentsLoaded = function(){
        var element = $("#commentList .annotationZoneReference").not('.hasOnClick');
        if($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
            //console.log("ADDED CLICK FUNCTION");
            //console.log($("#commentList .annotationZoneReference").length);
            $("#commentList .annotationZoneReference").not('.hasOnClick').click(function(){
                $scope.switchRegexHashFilter($(this).html());
            });

            $("#commentList .annotationZoneReference").not('.hasOnClick').addClass("hasOnClick");

            element.hover(function(){
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='"+rectId+"']").stop().fadeTo("fast", opacityFactorHighlight);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",1.0); //can be deleted because parent inherit its opacity
            }, function(){
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='"+rectId+"']").stop().fadeTo("fast",opacityFactor);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",opacityFactor);//can be deleted because parent inherit its opacity
            });

        }
    };

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
              $scope.commentsLoaded();
          });
        };
      });
    };

    function getCurrentFilters(){
        /*
        refactored by using array of filtersRaw. will be converted with JSON.stringify.
        regex_has and regex is replaced by using scope.switchregex... function

        var finalFilters;

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
        }*/

        if(!isNaN($scope.currentPageNumber)){
            $scope.filtersRaw['pdfPageNumber'] = $scope.currentPageNumber;
        }

      var finalFilters = JSON.stringify($scope.filtersRaw);

      console.log("Final Filters: " + finalFilters);
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

    /**
     * get comments on page load
     */
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

    $scope.$on('onFiltersRawChange', function(){
        $scope.parseOrderType($scope.orderType.id);
        //console.log("NOTICED FILTERS CHANGE");
        $scope.filters = getCurrentFilters($scope.filtersRaw);
        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        //console.log("commentGetUrl: " + $scope.commentGetUrl);
        updateScope($scope.commentGetUrl);
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

});
