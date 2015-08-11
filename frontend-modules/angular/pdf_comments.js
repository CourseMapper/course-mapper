app.controller('CommentListController', function($scope, $http, $rootScope, $sce, $timeout) {

    $scope.orderType = "author";
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = '';


    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;


    function updateScope(url){
      $http.get(url).success(function (data) {
        console.log('UPDATED');
        console.log(data);

        $scope.comments = data.comments;

        for(var i in $scope.comments){
          var cmnt = $scope.comments[i];
          cmnt.html = $sce.trustAsHtml(cmnt.html);

          $timeout(function(){
            $scope.$apply();
          });
        };
      });
    };

    function getCurrentFilters(filtersRaw){
      var finalFilters;
      if($scope.filtersRaw.length == 0)
        finalFilters='{}';
      else {
        var filterStrings = $scope.filtersRaw.split(';');
        finalFilters = '{';
        for(var i=0; i < filterStrings.length; i++){
          var temp = filterStrings[i].split(',');
          finalFilters = finalFilters + '"' + temp[0] + '":"' + temp[1] + '"';
          if(i != filterStrings.length-1)
            finalFilters = finalFilters + ',';
        }
        finalFilters = finalFilters + '}';

      }

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
      $scope.filters = getCurrentFilters($scope.filtersRaw);
      console.log("FILTERSCOPE CHANGED");
      console.log($scope.filters);
      $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"'+ $scope.orderType + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
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
