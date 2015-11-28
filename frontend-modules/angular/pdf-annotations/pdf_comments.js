app.controller('CommentListController', function ($scope, $http, $rootScope, $sce, $timeout, ActionBarService) {

    $scope.recentSubmitOnAnnotation = "";

    $scope.comment = {};

    $scope.editRawText = [];
    $scope.editMode = -1;

    $scope.replyRawText = [];
    $scope.replyMode = -1;

    $scope.comments = [];
    $scope.replies = [];

    $scope.orderType = false;
    $scope.orderBy = false;
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = {};
    $scope.currentPageNumber = 1;
    $scope.annotationZones = [];

    $scope.rawSearchTerm = "";
    var baseFilterString = "Currently no filters are active";
    $scope.activeFilterString = baseFilterString;

    /*var visibleString = "visibility: visible;";
    var invisibleString = "visibility: hidden;";
    $scope.removeFiltersVisible = visibleString;
    */

    // zones
    $scope.tagNames = [];
    $scope.tagRelPos = [];
    $scope.tagRelCoord = [];
    $scope.tagColor = [];

    $scope.writeCommentMode = false;



    var pdfPageChangeListener = $rootScope.$on('onPdfPageChange', function (e, params) {
        $scope.currentPageNumber = params[0];
        $scope.getComment($scope.orderType.id);
    });

    $rootScope.$on('$destroy',pdfPageChangeListener);

    $scope.orderingOptions = [
        {id: 'dateOfCreation.descending', name: 'Newest First'},
        {id: 'dateOfCreation.ascending', name: 'Oldest First'},
        {id: 'author.descending', name: 'Author (descending)'},
        {id: 'author.ascending', name: 'Author (ascending)'}
        //todo: {id: 'relevance', name: 'Relevance'}
    ];

    $scope.populateAnnotationZone = function () {
        $scope.annotationZones = [];

        // look for zones that are inside wrapper of the annotation zones
        var annotationList = $("#annotationZoneSubmitList div");

        //console.log(annotationList);

        for (var i = 0; i < annotationList.length; i++) {
            //console.log("added tag");
            //TODO: Adapt to next rectangle iteration
            var elementId = $("#annotationZoneSubmitList #rectangleId").eq(i).val();
            var element = $("#" + elementId);
            var relPosX = element.position().left / $('#annotationZone').width();
            var relPosY = element.position().top / $('#annotationZone').height();
            var relWidth = element.width() / $('#annotationZone').width();
            var relHeight = element.height() / $('#annotationZone').height();

            var name = element.find(".slideRectInput").val();
            //console.log("Name found: "+element.find(".slideRectInput").length);
            //var name = $("#annotationZoneSubmitList #annotationZoneSubmitName").eq(i).val();
            var color = element.find(".slideRectColorPicker").val().substring(1);
            //console.log("Color found: "+color);
            //var color = $("#annotationZoneSubmitList #annotationZoneSubmitColor").eq(i).val();

            if (name == "") {
                //console.log("Error encountered while extracting annotation zone during submission.");
                return false;
            }
            else if($rootScope.checkTagName(name) != "") {
                //console.log("TAGNAME NOT ACCEPTABLE");
                return false;
            }
            else {
                $scope.addAnnotationZoneData("#" + name, relPosX, relPosY, relWidth, relHeight, color, $scope.pdfFile._id, $scope.currentPageNumber );
            }
        }

        $scope.comment.tagNames = $scope.tagNames.join(',');
        $scope.comment.tagRelPos = $scope.tagRelPos.join(',');
        $scope.comment.tagRelCoord = $scope.tagRelCoord.join(',');
        $scope.comment.tagColor = $scope.tagColor.join(',');

        //TODO: Check integrity of the input
        //console.log("got here");
        return true;
    };

    /*TODO:ANGANNZONE
    $scope.populateAnnotationZone = function () {
        $scope.annotationZones = [];

        var tagNamesList = $rootScope.getTagNamesList();
        var annotationZoneList = $rootScope.getAnnotationZoneList();
        for(var inputId in tagNamesList) {
          var relPosX = annotationZoneList[inputId].relativePosition.x;
          var relPosY = annotationZoneList[inputId].relativePosition.y;
          var relWidth = annotationZoneList[inputId].relativeSize.x;
          var relHeight = annotationZoneList[inputId].relativeSize.y;

          var name = annotationZoneList[inputId].name;
          var color = annotationZoneList[inputId].color;

          if($rootScope.checkTagName(name) != "") {
              return false;
          }
          else {
              $scope.addAnnotationZoneData("#" + name, relPosX, relPosY, relWidth, relHeight, color, $scope.pdfFile._id, $scope.currentPageNumber );
          }
        }

        $scope.comment.tagNames = $scope.tagNames.join(',');
        $scope.comment.tagRelPos = $scope.tagRelPos.join(',');
        $scope.comment.tagRelCoord = $scope.tagRelCoord.join(',');
        $scope.comment.tagColor = $scope.tagColor.join(',');

        return true;
    };
    */

    $scope.addAnnotationZoneData = function (name, relPosX, relPosY, relWidth, relHeight, color, pdfId, pdfPageNumber) {
        $scope.tagNames.push(name);
        $scope.tagRelPos.push(relPosX + ";" + relPosY);
        $scope.tagRelCoord.push(relWidth + ";" + relHeight);
        $scope.tagColor.push(color);

        var zone = {
            annotationZoneName: name,
            relativeCoordinates: {
                X: relPosX,
                Y: relPosY
            },
            relativeDimensions: {
                X: relWidth,
                Y: relHeight
            },
            color: color,
            pdfId: pdfId,
            pdfPageNumber: pdfPageNumber,
            author: $scope.currentUser.username,
            authorID: $scope.currentUser._id
        };

        /*var oldText;
        oldText = $("#tagNames").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }

        $("#tagNames").val(oldText + "" + name);
        oldText = $("#tagRelPos").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagRelPos").val(oldText + "" + relPosX + ";" + relPosY);
        oldText = $("#tagRelCoord").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagRelCoord").val(oldText + "" + relWidth + ";" + relHeight);
        oldText = $("#tagColor").val();
        if (oldText.length != 0) {
            oldText = oldText + ",";
        }
        $("#tagColor").val(oldText + "" + color);*/

        $scope.annotationZones.push(zone);
        //$scope.annotationZones[$scope.annotationZones.length]=zone;

    };

    $scope.submitReply = function (id) {


      var config = {
        params: {
          rawText: $scope.replyRawText[id],
          author: $scope.currentUser.username,
          authorID: $scope.currentUser._id,
          pageNumber: $scope.currentPageNumber,
          numOfAnnotationZones: 0,
          pdfId: $scope.pdfFile._id,
          hasParent: true,
          parentId: id
        }
      };



      $http.post("/slide-viewer/submitComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment submission successful!");

                //TODO: reset everything
              }
              //console.log("commReplyEv");

              $scope.recentSubmitOnAnnotation = id;

              //console.log("Recent: "+ $scope.recentSubmitOnAnnotation);

              $rootScope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
              $scope.replyRawText = [];
              $scope.replyMode = -1;

          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.deleteCommentById = function (id) {
      //console.log(id);
      var config = {
          params: {
              deleteId: id,
              author: $scope.currentUser.username,
              authorId: $scope.currentUser._id
          }
      };

      $http.post("/slide-viewer/deleteComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment deletion successful!");
              }
              //console.log("commDeleteEv");

              $rootScope.$broadcast('reloadTags');
          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.submitComment = function (resultVarName) {
        var annZoneCheckResult = $scope.populateAnnotationZone();
        if(!annZoneCheckResult) {
          displayCommentSubmissionResponse("Client Error: Some of the attached annotation zones are invalid");
          return false;
        }

        $rootScope.clearTagNameErrors();

        var config = {
            params: {
                rawText: $scope.comment.rawText,
                author: $scope.currentUser.username,
                authorID: $scope.currentUser._id,
                pageNumber: $scope.currentPageNumber,
                tagNames: $scope.comment.tagNames,
                tagRelPos: $scope.comment.tagRelPos,
                tagRelCoord: $scope.comment.tagRelCoord,
                tagColor: $scope.comment.tagColor,
                annotationZones: $scope.annotationZones,
                numOfAnnotationZones: $scope.annotationZones.length,
                pdfId: $scope.pdfFile._id,
                hasParent: false
            }
        };

        $http.post("/slide-viewer/submitComment/", null, config)
            .success(function (data, status, headers, config) {
                $scope.updateScope($scope.commentGetUrl);
                //$scope.savedZones = data.annotationZones;

                if(data.result == false){
                  displayCommentSubmissionResponse(data.error);
                }
                else {
                  displayCommentSubmissionResponse("Comment submission successful!");

                  $scope.comment.rawText = '';
                  $scope.setQuillSelection();
                  $scope.comment.tagNames = '';
                  $scope.comment.tagRelPos = '';
                  $scope.comment.tagRelCoord = '';
                  $scope.comment.tagColor = '';

                  $("#annotationZoneSubmitList div").remove();
                }
                //console.log("commSubmitEv");
                $rootScope.$broadcast('reloadTags');

                $scope.writeCommentMode = false;
            })
            .error(function (data, status, headers, config) {
                displayCommentSubmissionResponse("Error: Unexpected Server Response!");
            });
    };


    $scope.submitEdit = function (comment) {


      var config = {
          params: {
              updateId: comment._id,
              author: $scope.currentUser.username,
              authorId: $scope.currentUser._id,
              rawText: $scope.editRawText[$scope.editMode]
          }
      };

      $http.post("/slide-viewer/updateComment/", null, config)
          .success(function (data, status, headers, config) {
              $scope.updateScope($scope.commentGetUrl);
              //$scope.savedZones = data.annotationZones;

              if(data.result == false){
                displayCommentSubmissionResponse(data.error);
              }
              else {
                displayCommentSubmissionResponse("Comment edit successful!");

                $scope.comment.rawText = '';
                $scope.setQuillSelection();
              }
              //console.log("commEditEv");
              $rootScope.$broadcast('reloadTags');

              $scope.writeCommentMode = false;
          })
          .error(function (data, status, headers, config) {
              displayCommentSubmissionResponse("Error: Unexpected Server Response!");
          });
    };

    $scope.setQuillSelection = function(){
        for(var i = 0; i < Quill.editors.length; i++){
            if(Quill.editors[i].quillId == '#rawText'){
                Quill.editors[i].setSelection(0,0);
            }
        }
    };

    function displayCommentSubmissionResponse(text) {
      var label = $("#commentSubmissionResponse");
      label.text(text);
      label.show();
      label.fadeOut(5000);
      //label.animate({opacity:0.0},5000);
    };

    $scope.currentUser = "";
    $rootScope.$watch('user', function () {
        if ($rootScope.user) {
            $scope.currentUser = $rootScope.user;
        }
    });

    $rootScope.displayCommentSubmissionResponse = function(text) {
      displayCommentSubmissionResponse(text);
    };



    //$scope.pageFilter;

    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;

    $scope.setRegexFilter = function (value) {
        if(typeof $scope.filtersRaw['rawText'] == 'undefined') {
          $scope.filtersRaw['rawText'] = {'regex': value};
        }
        else
          $scope.filtersRaw['rawText'].regex = value;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.switchRegexHashFilter = function (value) {
        //console.log("switchRegexHashFilter CALLED");
        if( typeof $scope.filtersRaw['renderedText'] == 'undefined')
          $scope.filtersRaw['renderedText'] = {'regex_hash': value.substring(1)};
        else if( $scope.filtersRaw['renderedText'].regex_hash != value.substring(1) )
          $scope.filtersRaw['renderedText'].regex_hash = value.substring(1);
        else
          delete $scope.filtersRaw['renderedText'];
        //console.log($scope.filtersRaw);

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.authorLabelClick = function (authorName) {
        //console.log("AUTHORLABELCLICK CALLED");
        if($scope.filtersRaw['author'] == authorName)
          delete $scope.filtersRaw['author'];
        else
          $scope.filtersRaw['author'] = authorName;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.$on('onFiltersRawChange', function () {
      var temp = "You are currently filtering for posts";
      var add = "";
      if ( typeof $scope.filtersRaw['author'] != 'undefined' && $scope.filtersRaw['author'] != "" )
        add += " authored by '" + $scope.filtersRaw['author'] + "'";
      if ( typeof $scope.filtersRaw['renderedText'] != 'undefined')
        if ( typeof $scope.filtersRaw['renderedText'].regex_hash != 'undefined' && $scope.filtersRaw['renderedText'].regex_hash != "" )
          add += " referencing the annotation zone '" + $scope.filtersRaw['renderedText'].regex_hash + "'";
      /*if(typeof $scope.filtersRaw['rawText'] != 'undefined')
        if ( $scope.filtersRaw['rawText'].regex != 'undefined' && $scope.filtersRaw['rawText'].regex != "")
          temp += " containing the term '" + $scope.filtersRaw['renderedText'].regex_hash + "'";
        */
      if(add.length == 0) {
        $scope.activeFilterString = baseFilterString;
        //$scope.removeFiltersVisible = invisibleString;

      }
      else {
        $scope.activeFilterString = temp + add;
        //$scope.removeFiltersVisible = visibleString;

      }

      $timeout(function () {
          $scope.$apply();
          $scope.commentsLoaded();
      });

    });

    $scope.removeActiveFilters = function () {
      if ( typeof $scope.filtersRaw['author'] != 'undefined' && $scope.filtersRaw['author'] != "" )
        delete $scope.filtersRaw['author'];
      if ( typeof $scope.filtersRaw['renderedText'] != 'undefined')
        delete $scope.filtersRaw['renderedText'];
      $scope.$broadcast('onFiltersRawChange');
    };

    //TODO:ANGANNZONE
    $scope.commentsLoaded = function () {
        var element = $("#commentList .annotationZoneReference").not('.hasOnClick');
        if ($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
            //console.log("ADDED CLICK FUNCTION");
            //console.log($("#commentList .annotationZoneReference").length);
            $("#commentList .annotationZoneReference").not('.hasOnClick').click(function () {
              //console.log("switchRegexHashFilter CALLED");
              $scope.switchRegexHashFilter($(this).html());
            });

            $("#commentList .annotationZoneReference").not('.hasOnClick').addClass("hasOnClick");

            element.hover(function () {
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='" + rectId + "']").stop().fadeTo("fast", opacityFactorHighlight);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",1.0); //can be deleted because parent inherit its opacity
            }, function () {
                var rectId = $(this).html();
                $("#annotationZone [data-tagName='" + rectId + "']").stop().fadeTo("fast", opacityFactor);
                //$(this).find(".slideRectSpan").stop().fadeTo("fast",opacityFactor);//can be deleted because parent inherit its opacity
            });

        }
    };

    $scope.changeEditMode = function (id, bool) {
      //$scope.finalEditRawText = "";
      $scope.editRawText = [];
      if(bool) {
        $scope.editMode = id;
        $scope.replyMode = -1;
        $scope.writeCommentMode = false;
        $rootScope.resetEditZoneMode();
      }
      else if($scope.editMode == id){
        $scope.editMode = -1;
      }
    };

    $rootScope.resetEditAndReplyMode = function (){
      $scope.editMode = -1;
      $scope.replyMode = -1;
      $scope.writeCommentMode = false;

    };

    $scope.changeReplyMode = function (id, bool) {
      //$scope.finalEditRawText = "";
      $scope.replyRawText = [];
      if(bool) {
        $scope.replyMode = id;
        $scope.editMode = -1;
        $scope.writeCommentMode = false;
        $rootScope.resetEditZoneMode();
      }
      else if($scope.replyMode == id){
        $scope.replyMode = -1;
      }
    };

    $scope.updateScope = function(url) {
        $http.get(url).success(function (data) {
            //console.log('COMMENTS UPDATED');
            //console.log("url: " + url);


            $scope.editMode = -1;
            /*for (var i in $scope.comments) {
                var cmnt = $scope.comments[i];
                //cmnt.html = $sce.trustAsHtml(cmnt.html);



            }*/
            $scope.comments = [];
            $scope.replies = [];

            for(var item in data.comments) {
              if(data.comments[item].hasParent == false) {
                //data.comments[item].isAuthor = true;
                $scope.comments.push(data.comments[item]);
              }
              else if(data.comments[item].hasParent == true){
                if(typeof $scope.replies[data.comments[item].parentId] == 'undefined') {
                  $scope.replies[data.comments[item].parentId] = [];
                }
                //console.log($scope.currentUser.username);
                //console.log(data.comments[item].author);
                data.comments[item].isAuthor = (data.comments[item].author == $scope.currentUser.username);
                $scope.replies[data.comments[item].parentId].push(data.comments[item]);
              }
            }

            //$scope.comments = data.comments;


            $timeout(function () {
                $scope.$apply();
                $scope.commentsLoaded();
            });

        });
    };

    function getCurrentFilters() {
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

        if (!isNaN($scope.currentPageNumber)) {
            $scope.filtersRaw['pdfPageNumber'] = $scope.currentPageNumber;
        }
        if (!(typeof ($scope.pdfFile._id) == "undefined")) {
          $scope.filtersRaw['pdfId'] = $scope.pdfFile._id;
        }


        //console.log($scope.filtersRaw);
        var finalFilters = JSON.stringify($scope.filtersRaw);

        //console.log("Final Filters: " + finalFilters);
        return finalFilters;
    }

    $scope.parseOrderType = function (orderType) {
        var orderSplit = orderType.split('.');
        $scope.orderBy = orderSplit[0];
        if (orderSplit[1]) {
            $scope.ascending = (orderSplit[1] == 'ascending') ? true : false;
        } else
            $scope.ascending = false;
    };

    $scope.getComment = function (orderType) {
        $scope.parseOrderType(orderType);

        $scope.filters = getCurrentFilters($scope.filtersRaw);
        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        $scope.updateScope($scope.commentGetUrl);
    };

    $scope.manageActionBar = function(){
        if($scope.currentTab == 'pdf') {

                //commented because we want to use own toolbar
          /*  ActionBarService.extraActionsMenu.push({
                clickAction: $scope.switchCommentSubmissionDisplay,
                title: '<i class="ionicons ion-edit"></i> &nbsp;ADD COMMENT',
                aTitle: 'Write a comment on this slide'
            });*/
        }
    };

    $scope.init = function () {
        //$scope.getComment($scope.orderingOptions[0].id); // commented, because it will get called once pdf get loaded
    };

    $scope.$watch("orderType", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.orderType = newValue;
            $scope.getComment(newValue.id);
        }
    });

    /*$scope.$watch("filtersRaw", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            //console.log("NOTICED FILTERS CHANGE");
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            $scope.updateScope($scope.commentGetUrl);
        }
    });*/

    $scope.$on('onFiltersRawChange', function () {
        $scope.parseOrderType($scope.orderType.id);
        //console.log("NOTICED FILTERS CHANGE");
        $scope.filters = getCurrentFilters($scope.filtersRaw);
        $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
        //console.log("commentGetUrl: " + $scope.commentGetUrl);
        $scope.updateScope($scope.commentGetUrl);
    });

    $scope.$watch("currentPageNumber", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            $scope.updateScope($scope.commentGetUrl);
        }
    });

    $scope.$watch("rawSearchTerm", function (newValue, oldValue) {
      if(newValue != oldValue) {
        $scope.setRegexFilter(newValue);
      }
    });

    $scope.$watch("writeCommentMode", function (newValue, oldValue) {
      if(newValue == true) {
        $scope.editMode = -1;
        $scope.replyMode = -1;
        $rootScope.resetEditZoneMode();
      }
      else {
        $rootScope.removeAllActiveAnnotationZones();
        $scope.comment.rawText = "";
      }
    });

    $scope.annotationZoneAction = function(){
        // in slideviewer.js
        $rootScope.switchShowAnnoZones = "On"
        createMovableAnnZone();
        //TODO:ANGANNZONE
        //$rootScope.createMovableAnnZone();
    };





    $scope.switchCommentSubmissionDisplay = function() {
        $scope.writeCommentMode = true;
    };

    $scope.$on('onAfterInitTreeNode', function(event, treeNode){
        /**
         * get comments on page load
         */
        $scope.init();

        /**
         * add some action to the menu
         */
        $scope.manageActionBar();
    });

    $scope.$on('$routeUpdate', function(){
        $scope.manageActionBar();
    });

    $scope.addReference = function(name) {
      //$rootScope.safeApply(function() {
      if($rootScope.nameHasNoError(name)){
        if(name !="#")
        if($scope.writeCommentMode) {
          if(typeof $scope.comment.rawText == 'undefined')
            $scope.comment.rawText = name + ' ';
          else {
            var len = $scope.comment.rawText.length;
            var firstPart = $scope.comment.rawText.substring(0,len-6);
            var lastPart = $scope.comment.rawText.substring(len-6);
            $scope.comment.rawText = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.editMode != -1){
          if(typeof $scope.editRawText[$scope.editMode] == 'undefined')
            $scope.editRawText[$scope.editMode] = name + ' ';
          else {
            var len = $scope.editRawText[$scope.editMode].length;
            var firstPart = $scope.editRawText[$scope.editMode].substring(0,len-6);
            var lastPart = $scope.editRawText[$scope.editMode].substring(len-6);
            $scope.editRawText[$scope.editMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.replyMode != -1){
          if(typeof $scope.replyRawText[$scope.replyMode] == 'undefined')
            $scope.replyRawText[$scope.replyMode] = name + ' ';
          else {
            var len = $scope.replyRawText[$scope.replyMode].length;
            var firstPart = $scope.replyRawText[$scope.replyMode].substring(0,len-6);
            var lastPart = $scope.replyRawText[$scope.replyMode].substring(len-6);
            $scope.replyRawText[$scope.replyMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }

        $timeout(function () {
            $scope.$apply();
            $scope.commentsLoaded();
        });
      }
    };

    /*TODO:ANGANNZONE

    $scope.addReference = function(id) {
      var annZoneList = $rootScope.getAnnotationZoneList();
      var name = annZoneList[id];
      //$rootScope.safeApply(function() {
      if($rootScope.nameHasNoError(name)){
        if(name !="#")
        if($scope.writeCommentMode) {
          if(typeof $scope.comment.rawText == 'undefined')
            $scope.comment.rawText = name + ' ';
          else {
            var len = $scope.comment.rawText.length;
            var firstPart = $scope.comment.rawText.substring(0,len-6);
            var lastPart = $scope.comment.rawText.substring(len-6);
            $scope.comment.rawText = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.editMode != -1){
          if(typeof $scope.editRawText[$scope.editMode] == 'undefined')
            $scope.editRawText[$scope.editMode] = name + ' ';
          else {
            var len = $scope.editRawText[$scope.editMode].length;
            var firstPart = $scope.editRawText[$scope.editMode].substring(0,len-6);
            var lastPart = $scope.editRawText[$scope.editMode].substring(len-6);
            $scope.editRawText[$scope.editMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }
        else if($scope.replyMode != -1){
          if(typeof $scope.replyRawText[$scope.replyMode] == 'undefined')
            $scope.replyRawText[$scope.replyMode] = name + ' ';
          else {
            var len = $scope.replyRawText[$scope.replyMode].length;
            var firstPart = $scope.replyRawText[$scope.replyMode].substring(0,len-6);
            var lastPart = $scope.replyRawText[$scope.replyMode].substring(len-6);
            $scope.replyRawText[$scope.replyMode] = firstPart + ' ' + name + ' ' + lastPart;
          }
        }

        $timeout(function () {
            $scope.$apply();
            $scope.commentsLoaded();
        });
      }
    };

    */

    $scope.setEditRawText = function(id,newText) {
      $scope.editRawText[id] = strip(newText);
      $timeout(function () {
          $scope.$apply();
      });
    };

    $scope.setReplyRawText = function(id,newText) {

      $scope.replyRawText[id] = newText;
      $timeout(function () {
          $scope.$apply();
      });
    };

    function strip(html)
    {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }

    /*$scope.$watch("editRawText", function (newValue, oldValue) {
      console.log("REGISTERED CHANGE");
    });*/

    $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
    };

    $scope.removeFilterRawField = function (id) {
      delete $scope.filtersRaw[id];
      $scope.$broadcast('onFiltersRawChange');
    };
});
