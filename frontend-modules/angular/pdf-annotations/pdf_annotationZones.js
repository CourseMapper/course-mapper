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

    $scope.setEditZoneMode = function(id,divCounter,color) {
      $rootScope.resetEditAndReplyMode();

      $scope.editZoneMode = id;

      var ele = $('select[name="colorpicker-change-background-color2"]');
      ele.parent().find(".simplecolorpicker").remove();
      ele.parent().css({"margin-left":"0px"});
      ele.remove();


      var nColorPickerEditInput = $('<select/>');
      nColorPickerEditInput.attr("name","colorpicker-change-background-color2");
      //nColorPickerEditInput.attr("value","#ac725e");
      //nColorPickerEditInput.attr("value",color);
      //nColorPickerEditInput.attr("ng-hide", "(editZoneMode != '"+id+"')");
      //nColorPickerEditInput.attr("ng-model", "editZoneValues['" + id + "'].color");
      nColorPickerEditInput.append('<option value="#ac725e">#ac725e</option>  <option value="#d06b64">#d06b64</option>  <option value="#f83a22">#f83a22</option>  <option value="#fa573c">#fa573c</option>  <option value="#ff7537">#ff7537</option>  <option value="#ffad46">#ffad46</option>  <option value="#42d692">#42d692</option>  <option value="#16a765">#16a765</option>  <option value="#7bd148">#7bd148</option>  <option value="#b3dc6c">#b3dc6c</option>  <option value="#fbe983">#fbe983</option>  <option value="#fad165">#fad165</option>  <option value="#92e1c0">#92e1c0</option>  <option value="#9fe1e7">#9fe1e7</option>  <option value="#9fc6e7">#9fc6e7</option>  <option value="#4986e7">#4986e7</option>  <option value="#9a9cff">#9a9cff</option>  <option value="#b99aff">#b99aff</option>  <option value="#c2c2c2">#c2c2c2</option>  <option value="#cabdbf">#cabdbf</option>  <option value="#cca6ac">#cca6ac</option>  <option value="#f691b2">#f691b2</option><option value="#cd74e6">#cd74e6</option><option value="#a47ae2">#a47ae2</option>');
      nColorPickerEditInput.attr("id", "colorPickerEditInput-" + divCounter);
      nColorPickerEditInput.addClass("slideRectColorPickerEdit");
      nColorPickerEditInput = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(nColorPickerEditInput);


      $scope.editZoneValues[id].color = color;

      var wrapperElement = $("#slideRectWrapper-"+divCounter);
      wrapperElement.prepend(nColorPickerEditInput);
      wrapperElement.css({"margin-left":"-20px"});

      //$("#rect-"+divCounter).css({opacity:"0.75"});
      $("#rect-"+divCounter).hover(function () {
          $(this).stop().fadeTo("fast", "0.75");
      }, function () {
          $(this).stop().fadeTo("fast", "0.75");
      });
      $("#rect-"+divCounter).css('border', ' 1px dashed white');

      $('select[name="colorpicker-change-background-color2"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
      $('select[name="colorpicker-change-background-color2"]').simplecolorpicker("selectColor",color);


      /*$('#destroy').on('click', function() {
        $('select').simplecolorpicker('destroy');
      });*/
      // By default, activate simplecolorpicker plugin on HTML selects
      //$('#init').trigger('click');


      nColorPickerEditInput.on('change', function() {
          $(this).parent().parent().parent().css('background-color', $(this).val());
          $(this).attr("value",$(this).val());
          $scope.editZoneValues[id].color = $(this).val();
          $timeout(function(){
            $scope.$apply();
          });
        });


    };

    $rootScope.resetEditZoneMode = function() {
      $scope.editZoneMode = -1;

      var ele = $('select[name="colorpicker-change-background-color2"]');
      ele.parent().find(".simplecolorpicker").remove();
      ele.parent().css({"margin-left":"0px"});
      ele.remove();
    };

    $scope.updateAnnZone = function (id) {

      var config = {
        params: {
          updateId: id,
          author: $scope.currentUser.username,
          authorId: $scope.currentUser._id,
          updatedAnnZone:
          {
            annotationZoneName: "#"+$scope.editZoneValues[$scope.editZoneMode].name,
            color: $scope.editZoneValues[$scope.editZoneMode].color.substring(1)
          },
          pdfId: $scope.pdfFile._id,
        }
      };

      console.log(config);



      $http.post("/slide-viewer/updateAnnZone/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                $rootScope.displayCommentSubmissionResponse(data.error);
              }
              else {
                $rootScope.displayCommentSubmissionResponse("Annotation zone update successful!");

                //TODO: reset everything
              }

              $scope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
              $scope.replyRawText = [];
              $scope.replyMode = -1;
              $rootScope.resetEditZoneMode();

          })
          .error(function (data, status, headers, config) {
              $rootScope.displayCommentSubmissionResponse("Error: Unexpected Server Response!");
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
