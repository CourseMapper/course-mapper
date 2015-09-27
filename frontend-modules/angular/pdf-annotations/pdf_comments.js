app.controller('CommentListController', function ($scope, $http, $rootScope, $sce, $timeout, ActionBarService) {

    $scope.comment = {};

    $scope.orderType = false;
    $scope.orderBy = false;
    $scope.ascending = "true";
    $scope.filters = '{}';
    $scope.filtersRaw = {};
    $scope.currentPageNumber = 1;
    $scope.annotationZones = [];

    // zones
    $scope.tagNames = [];
    $scope.tagRelPos = [];
    $scope.tagRelCoord = [];
    $scope.tagColor = [];

    $scope.writeCommentMode = false;

    $rootScope.$on('onPdfPageChange', function (e, newSlideNumber) {
        $scope.currentPageNumber = newSlideNumber;
        $scope.getComment($scope.orderType.id);
    });

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
            var color = element.find(".pick-a-color").val();
            //console.log("Color found: "+color);
            //var color = $("#annotationZoneSubmitList #annotationZoneSubmitColor").eq(i).val();

            if (name == "") {
                //console.log("Error encountered while extracting annotation zone during submission.");
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
            pdfPageNumber: pdfPageNumber
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

    $scope.submitComment = function () {
        $scope.populateAnnotationZone();

        var config = {
            params: {
                rawText: $scope.comment.rawText,
                author: $scope.currentUser.username,
                pageNumber: $scope.currentPageNumber,
                tagNames: $scope.comment.tagNames,
                tagRelPos: $scope.comment.tagRelPos,
                tagRelCoord: $scope.comment.tagRelCoord,
                tagColor: $scope.comment.tagColor,
                annotationZones: $scope.annotationZones,
                numOfAnnotationZones: $scope.annotationZones.length,
                pdfId: $scope.pdfFile._id
            }
        };

        $http.post("/slide-viewer/submitComment/", null, config)
            .success(function (data, status, headers, config) {
                $scope.updateScope($scope.commentGetUrl);
                //$scope.savedZones = data.annotationZones;

                $scope.comment.rawText = '';
                $scope.comment.tagNames = '';
                $scope.comment.tagRelPos = '';
                $scope.comment.tagRelCoord = '';
                $scope.comment.tagColor = '';

                console.log("SUBMISSION SUCCESSFUL");
                $scope.$broadcast('reloadTags');

                $scope.writeCommentMode = false;
            })
            .error(function (data, status, headers, config) {
                console.log("SUBMIT ERROR");
                $scope.writeCommentMode = false;
            });
    };

    $scope.currentUser = "";
    $rootScope.$watch('user', function () {
        if ($rootScope.user) {
            $scope.currentUser = $rootScope.user;
        }
    });

    //$scope.pageFilter;

    $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;

    $scope.switchRegexFilter = function (value) {
        $scope.filtersRaw['renderedText'] = {'regex': value};

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.switchRegexHashFilter = function (value) {
        $scope.filtersRaw['renderedText'] = {'regex_hash': value.substring(1)};
        console.log($scope.filtersRaw);

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.authorLabelClick = function (authorName) {
        $scope.filtersRaw['author'] = authorName;

        $scope.$broadcast('onFiltersRawChange');
    };

    $scope.commentsLoaded = function () {
        var element = $("#commentList .annotationZoneReference").not('.hasOnClick');
        if ($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
            //console.log("ADDED CLICK FUNCTION");
            //console.log($("#commentList .annotationZoneReference").length);
            $("#commentList .annotationZoneReference").not('.hasOnClick').click(function () {
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

    $scope.updateScope = function(url) {
        $http.get(url).success(function (data) {
            //console.log('COMMENTS UPDATED');
            //console.log("url: " + url);

            $scope.comments = data.comments;

            for (var i in $scope.comments) {
                var cmnt = $scope.comments[i];
                //cmnt.html = $sce.trustAsHtml(cmnt.html);

                $timeout(function () {
                    $scope.$apply();
                    $scope.commentsLoaded();
                });
            }
            ;
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

        var finalFilters = JSON.stringify($scope.filtersRaw);

        console.log("Final Filters: " + finalFilters);
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
            ActionBarService.extraActionsMenu.push({
                clickAction: $scope.switchCommentSubmissionDisplay,
                title: '<i class="ionicons ion-edit"></i> &nbsp;ADD COMMENT',
                aTitle: 'Write a comment on this slide'
            });
        }
    };

    $scope.init = function () {
        $scope.getComment($scope.orderingOptions[0].id);
    };

    $scope.$watch("orderType", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.orderType = newValue;
            $scope.getComment(newValue.id);
        }
    });

    $scope.$watch("filtersRaw", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.parseOrderType($scope.orderType.id);
            //console.log("NOTICED FILTERS CHANGE");
            $scope.filters = getCurrentFilters($scope.filtersRaw);
            $scope.commentGetUrl = '/slide-viewer/disComm/{"type":"' + $scope.orderBy + '","ascending":"' + $scope.ascending + '"}/' + $scope.filters;
            //console.log("commentGetUrl: " + $scope.commentGetUrl);
            $scope.updateScope($scope.commentGetUrl);
        }
    });

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

    $scope.annotationZoneAction = function(){
        // in slideviewer.js
        createMovableAnnZone();
    };

    $scope.switchCommentSubmissionDisplay = function() {
        $scope.writeCommentMode = true;
    }

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
});
