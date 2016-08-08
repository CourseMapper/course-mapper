app.controller('MapController', function ($scope, $http, $rootScope, $element, $filter,
                                          $timeout, $sce, $location, authService, socket,
                                          toastr, mapService, courseService, collapseService) {
  $scope.treeNodes = [];
  $scope.jsPlumbConnections = [];
  $scope.widgets = [];
  $scope.isTreeInitiated = false;
  $scope.infoToast = null;
  $scope.infoEmptyToast = null;
  $scope.instance = null;
  $scope.nodeModaltitle = "";
  $scope.currentNodeAction = {};
  // for our view to show plus/minus button
  $scope.collapseStatus = {};

  // {"0": {nodeId:isCollapsed},}
  $scope.nodeChildrens = {};
  $scope.firstloaded = true;
  $scope.queryText = '';
  $scope.matchesFound = {};
  var markedNode = '';
  var searchMatches;
  var searchMatchIndex = 0;

  /**
   * find node recursively
   *
   * @param obj
   * @param col next search will be the array value of this key
   * @param searchKey
   * @param searchValue
   * @returns []
   */
  var findNodes = function (obj, col, searchKey, searchValue) {
    var result = [];
    if (!searchValue) return result;

    var findInternal = function (obj, col, searchKey, searchValue) {
      for (var i in obj) {
        var tn = obj[i];
        var isMatch = tn[searchKey].toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
        if (tn[searchKey] && isMatch) {
          result.push(tn);
        }
        if (tn[col] && tn[col].length > 0) {
          findInternal(tn[col], col, searchKey, searchValue);
        }
      }
      return result;
    };
    return findInternal(obj, col, searchKey, searchValue);
  };

  var hideNodeTargetEdges = function (node) {
    _.each($element.find("[data-target='t" + node._id + "']"), function (c) {
      c.style.opacity = node.isHidden ? 0.15 : 1.0;
      c.style['-webkit-filter'] = 'grayscale(' + (node.isHidden ? 100 : 0) + '%)';
    });
  };

  $scope.findNextMatch = function () {
    if (!searchMatches || searchMatches.length <= 0) {
      return;
    }
    searchMatchIndex++;
    if (searchMatchIndex >= searchMatches.length) {
      searchMatchIndex = 0;
    }
    positionCanvasToNode(searchMatches[searchMatchIndex]);
  };

  $scope.getNodeStyle = function (node) {
    var style = {};
    var isSearching = $scope.queryText != '' || markedNode != '';
    if (isSearching) {
      style.opacity = ($scope.matchesFound[node._id] !== true) ? 0.25 : 1.0;
    } else {
      hideNodeTargetEdges(node);
    }
    return style;
  };

  $scope.findNode = function (obj, col, searchKey, searchValue) {
    return findNodes(obj, col, searchKey, searchValue)[0];
  };

  var updateMatchedResults = function (items) {
    _.each(items, function (item) {
      $scope.matchesFound[item._id] = true;
      var parent = findNodes($scope.treeNodes, 'childrens', '_id', item.parent)[0];
      while (parent) {
        collapseService.setExpand(parent._id);
        collapseService.affectVisual(false, parent, parent._id);
        $scope.collapseStatus[parent._id] = false;
        parent = findNodes($scope.treeNodes, 'childrens', '_id', parent.parent)[0];
      }
    });
    if (items && items.length > 0) {
      positionCanvasToNode(items[0]);
    }
    setConnectorsOpacity(!(_.isEmpty($scope.matchesFound)) ? 0.25 : 1.0)
  };

  $scope.lookupInTree = function () {
    $scope.matchesFound = {};
    searchMatches = null;
    searchMatches = findNodes($scope.treeNodes, 'childrens', 'name', $scope.queryText);
    if (searchMatches.length <= 0) {
      return;
    }
    updateMatchedResults(searchMatches);
  };

  //find the node from the query string and highlight it
  function highlightMarkedNode() {
    $scope.matchesFound = {};
    markedNode = $location.search().markedNode || '';
    if (!markedNode) {
      return;
    }
    var items = findNodes($scope.treeNodes, 'childrens', '_id', markedNode);
    if (items.length <= 0) {
      markedNode = '';
      toastr.warning(
        'Node does not exist', {
          allowHtml: true,
          autoDismiss: true,
          tapToDismiss: true,
          extendedTimeOut: 2000,
          timeOut: 5000,
          toastClass: 'toast wide'
        });
      return;
    }

    $timeout(function () {
      items.forEach(function (item) {
        item.isMarked = true;
      });
      updateMatchedResults(items);
      setConnectorsOpacity(0.15);
    }, 600);

    $timeout(function () {
      $scope.matchesFound = {};
      items.forEach(function (item) {
        item.isMarked = false;
      });
      $location.search('markedNode', null);
      markedNode = '';
      updateMatchedResults(items);
      setConnectorsOpacity(1.0);
    }, 5000)
  }

  var positionCanvasToNode = function (node) {
    if (!node) return;
    var offsetX = node.positionFromRoot.x;
    var offsetY = node.positionFromRoot.y;
    var pos = {
      left: Canvas.centerX - offsetX + 'px',
      top: Canvas.centerY - offsetY + 'px'
    };
    Canvas.position(pos, true);
  };

  var setConnectorsOpacity = function (opacity) {
    _.each($element.find('._jsPlumb_connector'), function (c) {
      c.style.opacity = opacity;
    });
  };

  $scope.initDropDownMenuHybrid = function () {
    $('#tree .course-map').on('click', function (event) {
      var target = $(event.target);
      var k = target.parents('div');
      if (k.hasClass('ui-draggable') && k.hasClass('w')) {
        return true;
      } else if (k.hasClass('center-course')) {
        return true;
      } else if (target.hasClass('w')) {
        return true;
      }

      if ($('.open').length > 0) {
        $('.open').removeClass('open');
        return false;
      }
    });
  };

  /**
   * get all categories, recursived on the server
   */
  $scope.initTab = function (course) {
    // add hover to center instantiate on hover
    $scope.initDropDown('center');

    mapService.init(course._id,

      function (treeNodes) {
        if (treeNodes.length > 0) {
          $scope.treeNodes = treeNodes;
          highlightMarkedNode();
        } else {
          $scope.initJSPlumb();
          $scope.showMapEmptyInfo();
        }

        socket.subscribe('map/' + course._id);
      },

      function (err) {
        console.log(err);
        //toastr.error('cannot load course tree');
      }
    );
  };

  $scope.tabOpened = function () {

    if (courseService.course) {
      $scope.course = courseService.course;

      if (mapService.treeNodes) {
        $scope.treeNodes = mapService.treeNodes;
      }

      $scope.initTab(courseService.course);
    } else {

      $scope.$on('onAfterInitCourse', function (event, course) {
        $scope.initTab(course);
      });
    }

    $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
  };

  // initiate draggable jqUI to the topic node
  $scope.initDraggable = function (jsPlumbInstance) {
    var w = window.innerWidth;
    var h = window.innerHeight;

    // let us drag and drop the cats
    var mapEl = jsPlumb.getSelector(".course-map .w");
    jsPlumbInstance.draggable(mapEl, {
      start: function (params) {
        var el = $(params.el);
        var nId = el.attr('id').substring(1);
        var simulated = el.attr('is-simulated');
        if (simulated && simulated == 'simulated') {
          return;
        }

        var owned = el.hasClass('owned');
        if (!owned) {
          params.drag.abort();
        }

        if (collapseService.isCollapsed(nId) !== false) {
          params.drag.abort();
        }
      },

      // update position on drag stop
      stop: function (params) {
        var el = $(params.el);
        var pos = el.position();
        var distanceFromCenter = {
          x: pos.left - Canvas.w / 2,
          y: pos.top - Canvas.h / 2
        };

        var simulated = el.attr('is-simulated');
        if (simulated && simulated == 'simulated') {
          el.attr('is-simulated', '');
          return;
        }

        var nId = el.attr('id').substring(1); // remove 't' from the node id
        found = false;
        var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nId);

        $scope.sendPosition(nId, distanceFromCenter, pNode);
      }
    });
  };

  $scope.sendPosition = function (nId, distanceFromCenter, pNode) {
    $http.put('/api/treeNodes/' + nId + '/positionFromRoot', distanceFromCenter)
      .success(function (res, status) {
        //console.log(res);
        if (pNode)
          pNode.positionFromRoot = distanceFromCenter;
      })
      .error(function (res, status) {
        console.log('err');
        console.log(res);
      });
  };

  $scope.initJSPlumb = function () {
    jQuery('.tree-container').css('visibility', 'hidden');
    Tree.init(Canvas.w, Canvas.h);
    jsPlumb.ready(function () {
      $scope.instance = jsPlumb.getInstance({
        Endpoint: ["Blank", {
          radius: 2
        }],
        //HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
        PaintStyle: {
          strokeStyle: "#3C8DBC",
          lineWidth: 2
        },
        ConnectionOverlays: [],
        Container: "course-map"
      });

      $scope.initDraggable($scope.instance);

      // initialise all '.w' elements as connection targets.
      $scope.instance.batch(function () {
        /* connect center to first level cats recursively*/
        $scope.interConnect('center', $scope.treeNodes, $scope.instance);

        /*blanket on click to close dropdown menu*/
        $scope.initDropDownMenuHybrid();
      });

      $timeout(function () {
        $scope.firstCollapse($scope.treeNodes);

        $scope.initiateCollapse();
        jQuery('.tree-container').css('visibility', 'visible');
      })
    });
  };

  $scope.firstCollapse = function (treeNodes) {
    if (!$scope.firstloaded)
      return;

    $scope.firstloaded = false;
    for (var i = 0; i < treeNodes.length; i++) {
      var child = treeNodes[i];

      if (child.isDeletedForever)
        continue;

      $scope.getChildLength(child._id, 0, child);
    }

    // collapse on first level
    for (var j in $scope.nodeChildrens[1]) {
      var totalKids = $scope.nodeChildrens[1][j];
      if (totalKids > 0) {
        collapseService.setCollapse(j);
        $scope.collapseStatus[j] = true;
      } else {
        collapseService.setExpand(j);
        $scope.collapseStatus[j] = false;
      }
    }
  };

  $scope.initiateCollapse = function () {
    for (var i in collapseService.collapsed) {
      var colEl = 't' + collapseService.collapsed[i];
      $scope.collapse(colEl, true);
    }
  };

  $scope.getChildLength = function (nid, level, treeNodes) {
    if ($scope.nodeChildrens[level] == undefined) {
      $scope.nodeChildrens[level] = {};
    }

    if ($scope.nodeChildrens[level][nid] == undefined) {
      $scope.nodeChildrens[level][nid] = 0;
    }

    var add = 0;
    if (treeNodes.childrens && treeNodes.childrens.length > 0)
      add = 1;

    $scope.nodeChildrens[level][nid] += add;

    if (level > 1) {
      if ($scope.nodeChildrens[level][nid] > 0) {
        collapseService.setCollapse(nid);
        $scope.collapseStatus[nid] = true;
      }
    }

    if (treeNodes.childrens && treeNodes.childrens.length > 0) {
      level++;
      for (var e in treeNodes.childrens) {
        var ch = treeNodes.childrens[e];
        $scope.getChildLength(ch._id, level, ch);
      }
    } else {
      //console.log(level + ' ' + JSON.stringify($scope.nodeChildrens[level]));
    }
  };

  $scope.initDropDown = function (slug) {
    $('#' + slug)
      .on('click mousedown mouseup touchstart', function (event) {

        if (
          event.type == 'touchstart' && (
          event.target.className.indexOf('fa-plus-square') > -1 ||
          event.target.className.indexOf('fa-minus-square') > -1)
        ) {
          var el = event.target.parentNode;
          $timeout(function () {
            angular.element(el).triggerHandler('click');
          }, 0);
        }

        if ($(this).find('ul').hasClass('open')) {
          if ($(this).find('ul').hasClass('dropdown-course')) {
            if (event.type == 'touchstart') {
              if (event.target.href) {
                window.location.href = event.target.href;
              } else if (event.target.innerText == ' Edit' ||
                event.target.innerText == ' Delete' ||
                event.target.innerText == ' Delete Forever' ||
                event.target.innerText.indexOf('Add') > -1
              ) {
                var el = event.target;
                $timeout(function () {
                  angular.element(el).triggerHandler('click');
                  var mdlName = $(el).attr('data-target');
                  if (mdlName)
                    $(mdlName).modal('show');
                }, 0);

                return true;
              }
            } else
              return true;
          }

          $('.open').removeClass('open');
          return false;
        }

        var simulated = $(this).attr('is-simulated');
        if (simulated && simulated == 'simulated') {
          return true;
        }

        $('.open').not($(this).parents('ul')).removeClass('open');
        $(this).find('ul').addClass('open');

        if (event.type == 'touchstart') {
          $scope.requestIconAnalyitics(slug);
          return true;
        }

        return false;
      })
      .on('mouseenter', function () {
        if ($(this).hasClass('subTopic')) {
          return true;
        }
        if ($(this).hasClass('deleted')) {
          return true;
        }
        $scope.requestIconAnalyitics(slug);
      });
  };

  $scope.showMapInfo = function () {
    if (!$scope.infoToast) {
      $scope.infoToast = toastr.info(
        'To add a pdf or a video node (which we call "Content Node"), ' +
        '<br>you need to have at least a subtopic node that acts as a hub.' +
        '<br>' +
        '<br>Hover over the node to see available actions, such as create subtopic or content node', {
          allowHtml: true,
          autoDismiss: false,
          onHidden: function () {
            if ($scope.infoToast) $scope.infoToast = null;
          },
          tapToDismiss: true,
          extendedTimeOut: 10000,
          timeOut: 10000,
          toastClass: 'toast wide',
        });
    } else {
      toastr.clear();
      $scope.infoToast = null;
    }
  };

  $scope.showMapEmptyInfo = function () {
    if (!$scope.infoEmptyToast) {
      toastr.clear();
      $scope.infoEmptyToast = toastr.info(
        'Hi, this course is new, Please add a subtopic first, ' +
        '<br>from there, you can add a content node, then upload a pdf or a video.' +
        '<br>' +
        '<br>Hover over the center node to see available actions.', {
          allowHtml: true,
          autoDismiss: false,
          onHidden: function () {
            if ($scope.infoEmptyToast) $scope.infoEmptyToast = null;
          },
          tapToDismiss: true,
          extendedTimeOut: 10000,
          timeOut: 10000,
          toastClass: 'toast wide'
        });
    } else {
      $scope.infoEmptyToast = null;
    }
  };

  $scope.interConnect = function (parent, treeNodes, instance) {
    // added "t" in id because id cannot start with number
    for (var i = 0; i < treeNodes.length; i++) {
      var child = treeNodes[i];
      var childId = 't' + child._id;

      if (child.isDeletedForever)
        continue;

      // instantiate on hover
      $scope.initDropDown(childId);

      // connecting parent and chidlern
      var conn = instance.connect({
        source: parent,
        target: childId,
        anchors: [
          ["Perimeter", {
            shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")
          }],
          ["Perimeter", {
            shape: jsPlumb.getSelector('#' + childId)[0].getAttribute("data-shape")
          }]
        ],
        deleteEndpointsOnDetach: true,
        connector: ["Bezier", {
          curviness: 5
        }]
      });

      $(conn.connector.canvas).attr('data-source', parent);
      $(conn.connector.canvas).attr('data-target', childId);

      var cc = {
        source: parent,
        target: childId,
        conn: conn
      };

      $scope.jsPlumbConnections.push(cc);

      if (child.childrens)
        $('#' + parent + ' .collapse-button').addClass('hasChildren');
      if (child.childrens && child.childrens.length > 0) {
        $scope.interConnect(childId, child.childrens, instance);
      }
    }
  };

  $scope.setMode = function (mode, type, parent) {
    switch (mode) {
      case 'add':
        $scope.currentNodeAction.mode = "add";
        break;
      case 'edit':
        $scope.currentNodeAction.mode = "edit";
        break;
    }

    switch (type) {
      case 'subTopic':
        $scope.currentNodeAction.type = "subTopic";
        $scope.currentNodeAction.typeText = "Sub Topic";
        break;

      case 'contentNode':
        $scope.currentNodeAction.type = "contentNode";
        $scope.currentNodeAction.typeText = "Content Node";
        break;
    }

    $scope.nodeModaltitle = $scope.currentNodeAction.mode + " " + $scope.currentNodeAction.typeText;

    if (parent) {
      $scope.currentNodeAction.parent = parent;
      if (mode == 'add')
        $scope.nodeModaltitle += " under " + parent.name;
    } else
      $scope.currentNodeAction.parent = false;

    $rootScope.$broadcast('onAfterSetMode', $scope.course);
  };

  $scope.parseResources = function () {
    for (var i = 0; i < $scope.currentNodeAction.parent.resources.length; i++) {
      var content = $scope.currentNodeAction.parent.resources[i];
      if (content['type'] == 'mp4' || content['type'] == 'video' || content['type'] == 'videoLink') {
        $scope.currentNodeAction.parent.videoFile = content;
      } else if (content['type'] == 'pdf' || content['type'] == 'pdfLink') {
        $scope.currentNodeAction.parent.pdfFile = content;
      }
    }
  };

  /**
   * remove all svg generated by js plumb.
   */
  $scope.destroyJSPlumb = function () {
    for (var i in $scope.jsPlumbConnections) {
      var conn = $scope.jsPlumbConnections[i].conn;
      jsPlumb.detach(conn);
    }

    $scope.jsPlumbConnections = [];
  };

  $scope.reInitiateJSPlumb = function (cb) {
    $scope.treeNodes = angular.copy($scope.treeNodes);
    $timeout(
      function () {
        $scope.$apply();
        $scope.initJSPlumb();

        if (cb) {
          cb();
        }
      });
  };

  $scope.resourceIcon = function (filetype) {
    switch (filetype) {
      case 'pdf':
      case 'pdfLink':
        return 'fa fa-file-pdf-o';

      case 'mp4':
      case 'videoLink':
      case 'video':
        return 'fa fa-file-video-o';
    }
  };

  $scope.hasPdf = function (resources) {
    for (var i in resources) {
      if (resources[i].type == 'pdf') {
        return true;
      }
    }

    return false;
  };

  $scope.getPdfLink = function (resources) {
    for (var i in resources) {
      if (resources[i].type == 'pdf') {
        return resources[i].link;
      }
    }

    return false;
  };

  $scope.getDataShape = function (nodeType) {
    if (nodeType == 'subTopic')
      return 'Ellipse';

    return 'Rectangle';
  };

  $scope.requestIconAnalyitics = function (nodeId) {
    nodeId = nodeId.substring(1);
    if (nodeId == 'enter')
      return;

    $http.get('/api/server-widgets/topic-icon-analytics/?nodeId=' + nodeId).success(
      function (res) {
        $scope.isRequesting = false;
        if (res.result) {
          $scope.widgets[nodeId] = $sce.trustAsHtml(res.widgets);
        }
      }
    ).error(function () {
      $scope.isRequesting = false;
    });
  };

  $scope.getContentNodeLink = function (d) {
    return '/treeNode/' + d._id + '/#/cid/' + $scope.course._id + '/nid/' + d._id;
  };

  $scope.deleteNode = function (data) {
    var msg = '';
    if (data.type == 'subTopic') {
      msg = 'Are you sure you want to delete this sub topic?';
    } else {
      msg = 'Are you sure you want to delete this content node?';
    }

    if (confirm(msg)) {
      $http({
        method: 'DELETE',
        url: '/api/treeNodes/' + data._id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .success(function (res) {
          //console.log(res);
          if (res.result) {
            data.isDeleted = true;
            data.name = '[DELETED]';

            // destroy the jsplumb instance and svg rendered
            $scope.destroyJSPlumb();

            // this will reinitiate the model, and thus also jsplumb connection
            $scope.reInitiateJSPlumb();

          } else {
            if (data.result != null && !data.result) {
              $scope.errors = data.errors;
              console.log(data.errors);
            }
          }
        });
    }
  };

  $scope.deleteNodeForever = function (data) {
    var msg = 'Are you sure you want to delete this content node forever?';
    if (data.type == 'subTopic') {
      msg = 'Are you sure you want to delete this sub topic forever?';
    }

    if (confirm(msg)) {
      $http({
        method: 'DELETE',
        url: '/api/treeNodes/' + data._id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
        .success(function (res) {
          if (res.result) {
            data.isDeleted = true;
            data.isDeletedForever = true;
            data.name = '[DELETED]';

            // destroy the jsplumb instance and svg rendered
            $scope.destroyJSPlumb();

            // this will reinitiate the model, and thus also jsplumb connection
            $scope.reInitiateJSPlumb();

            mapService.deleteNode(data);
          }
        })
        .error(function (data) {
          $scope.errors = data.errors;
          toastr.error(data.errors);
        });
    }
  };

  $scope.isNodeOwner = function (tn) {
    if (tn.createdBy._id == $scope.user._id)
      return true;
    else if (tn.createdBy == $scope.user._id)
      return true;

    return false;
  };

  $scope.toggleNodeVisibility = function (node) {

    var isHidden = !node.isHidden; //toggle visibility

    $http.put('/api/visibility/' + node._id + '/' + isHidden)
      .then(function (res) {
        node.isHidden = isHidden;
      });
  };

  $scope.isAuthorized = function (tn) {
    return ($scope.isNodeOwner(tn) || $scope.isAdmin || $scope.isManager || $scope.isOwner);
  };

  /// Node.name == 'java'
  /*
   var $scope.findNode($scope.treeNodes, 'childrens', 'name', queryText)

   */

  $scope.addNewNodeIntoPool = function (treeNode) {
    if (treeNode.parent) {
      found = false;
      var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode.parent);

      if (pNode) {
        pNode.childrens.push(treeNode);
      }
    } else
      $scope.treeNodes.push(treeNode);

    $timeout(function () {
      $scope.$apply();

      // destroy the jsplumb instance and svg rendered
      $scope.destroyJSPlumb();

      // this will reinitiate the model, and thus also jsplumb connection
      $scope.reInitiateJSPlumb(function () {
        $scope.donotInit = true;
        if ($('.open').length > 0) {
          $('.open').removeClass('open');
          return true;
        }
      });
    });

  };

  $scope.afterEditNode = function (treeNode) {
    if (treeNode) {
      found = false;
      var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
      if (pNode) {
        pNode.name = treeNode.name;
      }
    }

    $timeout(
      function () {
        $scope.$apply();
      });
  };

  $scope.afterEditContentNode = function (treeNode) {
    if (treeNode) {
      found = false;
      var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
      if (pNode) {
        pNode.name = treeNode.name;
        pNode.resources = [];
        if (treeNode.resources.length > 0) {
          for (var i in treeNode.resources) {
            pNode.resources.push(treeNode.resources[i]);
          }
        }
      }
    }

    $timeout(
      function () {
        $scope.$apply();
      });
  };

  $scope.collapse = function (el, isInit) {
    var nodeId = el.substring(1);

    found = false;
    var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nodeId);
    if (pNode) {
      var hide = false;

      if (isInit === true)
        hide = collapseService.isCollapsed(nodeId);
      else
        hide = collapseService.toggle(nodeId);

      if (hide === false) {
        $scope.collapseStatus[nodeId] = false;
        $('#' + el).addClass('aborted');
        collapseService.affectVisual(false, pNode, nodeId);
      } else if (hide >= 0 || hide == true) {
        $scope.collapseStatus[nodeId] = true;
        collapseService.affectVisual(true, pNode, nodeId);
        $('#' + el).removeClass('aborted');
      }

    }
  };

  $scope.$on('onAfterCreateNode', function (event, treeNode) {
    $scope.addNewNodeIntoPool(treeNode);
  });

  $scope.$on('onAfterEditNode', function (event, treeNode) {
    $scope.afterEditNode(treeNode);
  });

  $scope.$on('onAfterEditContentNode', function (event, treeNode) {
    $scope.afterEditContentNode(treeNode);
  });

  $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
    if (!$scope.isTreeInitiated && !$scope.donotInit) {
      $scope.isTreeInitiated = true;
      $scope.initJSPlumb();
    } else {
      $scope.donotInit = true;
    }
  });

  $scope.$on('onAfterSetMode', function (event, course) {
    if ($scope.currentNodeAction.type == "contentNode") {
      $scope.parseResources();
    }
  });

  $(document).ready(function () {
    $scope.width = jQuery(window).width();
    $scope.height = jQuery(window).height();
    $scope.center = {
      x: $scope.width / 2,
      y: ($scope.height / 2) - 100
    };
  });

  $scope.tabOpened();

  socket.on('joined', function (data) {
    //console.log(JSON.stringify(data));
  });

  socket.on('positionUpdated', function (data) {
    if (authService.user && data.userId == authService.user._id)
      return;

    var nd = data.nodeId;
    if (nd) {
      var elName = 't' + nd;
      var lv = Tree.leaves[elName];
      if (lv) {
        lv.fromCenter.x = data.x + 70;
        lv.fromCenter.y = data.y + 5;
        var oldPos = lv.el.position();
        var newPos = lv.getNewPosition(Tree.w, Tree.h);

        var dx = newPos.x - oldPos.left;
        var dy = newPos.y - oldPos.top;

        $('#' + elName).attr("is-simulated", 'simulated');
        $('#' + elName).simulate("drag-n-drop", {
          dx: dx,
          dy: dy
        })
      }

      found = false;
      var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nd);
      if (pNode) {
        pNode.positionFromRoot = {
          x: data.x,
          y: data.y
        };
        mapService.updatePosition(nd, data);
        $timeout(function () {
          $scope.$apply();
        });
      }

    }
  });

  socket.on('nodeCreated', function (data) {
    if (authService.user && data.userId == authService.user._id)
      return;

    $scope.addNewNodeIntoPool(data);
    mapService.addNode(data);
  });

  socket.on('nodeUpdated', function (data) {
    if (authService.user && data.userId == authService.user._id)
      return;

    if (data.type == 'contentNode') {
      $scope.afterEditContentNode(data);
    } else {
      $scope.afterEditNode(data);
    }
    mapService.updateNode(data);
  });

  socket.on('nodeDeleted', function (data) {
    if (authService.user && data.userId == authService.user._id)
      return;

    found = false;
    var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', data.nodeId);
    if (pNode) {
      pNode.isDeleted = true;
      if (data.isDeletedForever)
        pNode.isDeletedForever = true;

      pNode.name = '[DELETED]';

      mapService.deleteNode(data);

      // destroy the jsplumb instance and svg rendered
      $scope.destroyJSPlumb();

      // this will reinitiate the model, and thus also jsplumb connection
      $scope.reInitiateJSPlumb();
    }
  })
});
