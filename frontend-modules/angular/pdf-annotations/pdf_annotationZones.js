app.controller('AnnotationZoneListController', function($scope, $http, $rootScope, $sce, $timeout, $injector) {

    $scope.storedAnnZones = [];
    $scope.storedAnnZoneColors = [];
    $scope.tagNamesList = "";
    $scope.tagNameErrors = {};

    $scope.editZoneMode = -1;
    $scope.editZoneValues = [];

    //$scope.annZoneMov = [];



    /*$scope.$watchCollection("storedAnnZones",function(newValue,oldValue){
      console.log($scope.storedAnnZones);
    });*/

    /*$scope.annZoneMov.reposition = function(params) {
        if (params.position) {
            annZoneMov.position = params.position;
        }
        if (params.size) {
            annZoneMov.size = params.size;
        }
    };*/

    $scope.updateAnnZone = function (id) {


      var config = {
        params: {
          updateId: id,
          author: $scope.currentUser.username,
          authorID: $scope.currentUser._id,
          updatedAnnZone:
          {
            annotationZoneName: $scope.editZoneValues[$scope.editZoneMode].name,
            color: $scope.editZoneValues[$scope.editZoneMode].color
          }
        }
      };



      $http.post("/slide-viewer/updateAnnZone/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Annotation zone update successful!");

                //TODO: reset everything
              }

              $scope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
              $scope.replyRawText = [];
              $scope.replyMode = -1;

          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
      };

      $rootScope.removeAllActiveAnnotationZones = function () {
        for(var inputId in $scope.tagNamesList) {
            var element = $("#annotationZone #"+inputId);

            //var annotationInList = $("#annotationZoneSubmitList div").find("#"+id);

          //console.log("Will remove " +  annotationInList.length + " elements with id " + id);
          //var inputId = element.attr("id");*/
          console.log(angular.element($("#annZoneList")).scope().tagNamesList);
          console.log(angular.element($("#annZoneList")).scope().tagNamesList[inputId]);
          console.log(inputId);
          delete angular.element($("#annZoneList")).scope().tagNamesList[inputId];
          angular.element($("#annZoneList")).scope().timeout();

          //annotationInList.parent().remove();
          element.remove();

          delete $scope.tagNameErrors[inputId];
          delete $scope.tagNamesList[inputId];


          /*var element = $(childElement).parent();
          var rectId = element.find("#rectangleId").val();
          var rectElement = $("#"+rectId);
          rectElement.remove();
          element.remove();*/
        }
      };

    $rootScope.removeAnnotationZone = function (id) {
      var element = $("#annotationZone #"+id);

      var annotationInList = $("#annotationZoneSubmitList div").find("#"+id);

      //console.log("Will remove " +  annotationInList.length + " elements with id " + id);
      var inputId = element.attr("id");
      console.log(angular.element($("#annZoneList")).scope().tagNamesList);
      console.log(angular.element($("#annZoneList")).scope().tagNamesList[inputId]);
      console.log(inputId);
      delete angular.element($("#annZoneList")).scope().tagNamesList[inputId];
      angular.element($("#annZoneList")).scope().timeout();

      annotationInList.parent().remove();
      element.remove();

      delete $scope.tagNameErrors[id];
      delete $scope.tagNamesList[id];


      /*var element = $(childElement).parent();
      var rectId = element.find("#rectangleId").val();
      var rectElement = $("#"+rectId);
      rectElement.remove();
      element.remove();*/

    };

//    $scope.removeAnnotationZone = function (id) {
      //$rootScope.removeAnnotationZone(id);
    //};

    $scope.refreshTags = function() {
      $http.get('/slide-viewer/disAnnZones/' + $scope.pdfFile._id + '/'+$scope.currentPageNumber).success(function (data) {
        //console.log('TAGS UPDATED OF PAGE ' + $scope.currentPageNumber);
        $scope.annZones = data.annZones;

        tagListLoaded($scope.annZones);

        $timeout(function(){
          $scope.$apply();
        });


        /*$scope.$on('$stateChangeSuccess', function(){
          console.log("ALL DONE AJS");
        });
        */

      });
    };




    $rootScope.$on('onPdfPageChange', function(e, newSlideNumber){
      $scope.$emit('reloadTags');
    });

    $scope.$on('reloadTags', function(event) {
      //console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });

    /*
    use onPdfPageChange event instead
    $scope.$watch("currentPageNumber",function(newValue,oldValue){
      //console.log("LOADED RESET");
      $(".slideRect").remove();

      annotationZonesAreLoaded = false;

      toDrawAnnotationZoneData = [];
      $scope.refreshTags();
    });*/

    $scope.compileMovableAnnotationZone = function(element) {
      return angular.element(
        $injector.get('$compile')(element)($scope)
      );
    };

    $scope.$watch("tagNamesList", function (newValue, oldValue) {
      if(newValue != oldValue) {
        //console.log("IAM ANGRY");
        //console.log(newValue);
        //console.log(oldValue);
        if(typeof $scope.annZones != "undefined") {
          for(var key in newValue) {
            //console.log(newValue[key]);
            var response = $rootScope.checkTagName(newValue[key]);
            if(response.length != 0) {
              changeValidationDisplay(key, newValue[key], false, response)
            }
            else {
              changeValidationDisplay(key, newValue[key], true, response)
            }
          }
        }
      }
    },true);

    $rootScope.checkTagName = function (tagName) {
      if(!(/^[a-zA-Z0-9]*$/.test(tagName))) {
        return "Annotation zone contains illegal characters (only alphanumeric allowed)";
      }
      if(!(tagName.length >= 3)) {
        return "Annotation zone name is too short (>=3 characters)";
      }
      if(!(tagName.length < 10)) {
        return "Annotation zone name is too long (<10 characters)";
      }
      if(inOldTagList(tagName)) {
        return "Annotation zone name is already taken (unique over entire document)";
      }

      return "";
    }

    function inOldTagList(tagName) {
      //console.log($scope.annZones);
      for(var key in $scope.annZones) {
        if($scope.annZones[key].name == "#"+tagName) {
          return true;
        }
      }
      return false;
    }

    function changeValidationDisplay (key, name, success, text) {
      if(success){
        //console.log("VAL SUCCESS ON " + key);
        $("#"+key).find(".validationIcon").addClass("glyphicon");
        $("#"+key).find(".validationIcon").removeClass("glyphicon-remove-sign");
        $("#"+key).find(".validationIcon").addClass("glyphicon-ok-sign");
        delete $scope.tagNameErrors[key];
        $timeout(function(){
          $scope.$apply($scope.tagNameErrors);
        });
        //TODO: success
      }
      else {
        //console.log("VAL ERROR ON " + key + ": "+text);
        $("#"+key).find(".validationIcon").addClass("glyphicon");
        $("#"+key).find(".validationIcon").removeClass("glyphicon-ok-sign");
        $("#"+key).find(".validationIcon").addClass("glyphicon-remove-sign");
        $scope.tagNameErrors[key] = {name : name, text : text};
        //console.log($scope.tagNameErrors);
        //console.log($scope.tagNameErrors[key]);
        $timeout(function(){
          $scope.$apply($scope.tagNameErrors);
        });
        //TODO: failure
      }
    }

    $rootScope.clearTagNameErrors = function () {
      /*for(var key in $scope.tagNameErrors) {
        delete $scope.tagNameErrors[key];
        //console.log($scope.tagNameErrors[key]);
      }*/
      $scope.tagNameErrors = JSON.parse(JSON.stringify({}));
      $scope.tagNamesList = JSON.parse(JSON.stringify({}));

      $timeout(function(){
        $scope.$apply($scope.tagNameErrors);
      });
    };

    $scope.timeout = function () {
      $timeout(function(){
        $scope.$apply($scope.tagNameErrors);
      });
    };
});
