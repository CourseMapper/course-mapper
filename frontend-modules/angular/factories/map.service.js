app.factory('mapService', ['$rootScope', '$http', function ($rootScope, $http) {
  return {
    treeNodes: null,
    /*var for testing in findNode function*/
    found: false,

    init: function (courseId, success, error, force) {
      var self = this;

      if (!force && self.treeNodes) {
        if (success)
          success(self.treeNodes);
      }

      else if (force || !self.treeNodes)
        $http.get('/api/treeNodes/course/' + courseId)
          .success(function (data) {
            if (data.result) {
              self.treeNodes = data.treeNodes;
              if (success)
                success(self.treeNodes);
            }
          })

          .error(function (data) {
            if (error)
              error(data.errors);
          });
    },

    //socket method
    updatePosition: function (nid, data) {
      this.found = false;
      var pNode = this.findNode(this.treeNodes, 'childrens', '_id', nid);
      if (pNode) {
        pNode.positionFromRoot = {x: data.x, y: data.y};
      }
    },

    // socket method
    updateNode: function (treeNode) {
      this.found = false;
      var pNode = this.findNode(this.treeNodes, 'childrens', '_id', treeNode._id);
      if (pNode) {
        pNode.name = treeNode.name;
        if (pNode.type == 'contentNode') {
          pNode.resources = [];
          if (treeNode.resources.length > 0) {
            for (var i in treeNode.resources) {
              pNode.resources.push(treeNode.resources[i]);
            }
          }
        }
      }
    },

    // socket method
    deleteNode: function (treeNode) {
      this.found = false;
      var pNode = this.findNode(this.treeNodes, 'childrens', '_id', treeNode._id);
      if (pNode) {
        pNode.isDeleted = true;
        if (treeNode.isDeletedForever)
          pNode.isDeletedForever = true;

        pNode.name = '[DELETED]';
      }
    },

    // socket method
    addNode: function (treeNode) {
      this.found = false;
      var pNode = this.findNode(this.treeNodes, 'childrens', '_id', treeNode.parent);

      if (!pNode) {
        if (treeNode.parent) {
          this.found = false;
          var pNode = this.findNode(this.treeNodes, 'childrens', '_id', treeNode.parent);

          if (pNode) {
            pNode.childrens.push(treeNode);
          }
        }
        else
          this.treeNodes.push(treeNode);
      }
    },

    findNode: function (obj, col, searchKey, searchValue) {
      if (this.found)
        return this.found;

      for (var i in obj) {
        var tn = obj[i];

        if (tn[searchKey] && tn[searchKey] == searchValue) {
          this.found = tn;
          return tn;
        }
        else if (tn[col] && tn[col].length > 0) {
          // search again
          this.findNode(tn[col], col, searchKey, searchValue);
        }
      }

      if (this.found)
        return this.found;
    },

    isInitialized: function () {
      if (!this.treeNodes) {
        return false;
      }

      return true;
    }
  }
}
]);