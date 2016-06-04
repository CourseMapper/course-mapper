app.factory('collapseService', ['$rootScope', '$http', function ($rootScope, $http) {
  return {
    collapsed: [],

    isCollapsed: function (nodeId) {
      var idx = this.collapsed.indexOf(nodeId);
      if (idx != -1) {
        return idx;
      }

      return false;
    },

    /**
     *
     * @param nodeId
     * @returns {boolean} true: hide, false: show
     */
    toggle: function (nodeId) {
      var idx = this.isCollapsed(nodeId);
      if (idx === false) {
        // hidden, now set it to hide
        this.collapsed.push(nodeId);
        this.localStorageSave(nodeId, 1);
        // true means hide
        return true;
      } else {
        // show back
        this.collapsed.splice(idx, 1);
        this.localStorageSave(nodeId, 0);
        return false;
      }
    },

    setCollapse: function (nodeId) {
      var idx = this.isCollapsed(nodeId);
      if (idx === false) {
        // hidden, now set it to hide
        this.collapsed.push(nodeId);
        this.localStorageSave(nodeId, 1);
        // true means hide
        return true;
      }
      return false;
    },

    setExpand: function (nodeId) {
      var idx = this.isCollapsed(nodeId);
      if (idx !== false) {
        // show back
        this.collapsed.splice(idx, 1);
        this.localStorageSave(nodeId, 0);
        return true;
      }
      return false;
    },


    setCollapseFirst: function (nodeId) {
      var idx = this.isCollapsed(nodeId);
      if (idx === false) {
        // hidden, now set it to hide
        this.collapsed.push(nodeId);
        // true means hide
        return true;
      }
      return false;
    },

    setExpandFirst: function (nodeId) {
      var idx = this.isCollapsed(nodeId);
      if (idx !== false) {
        // show back
        this.collapsed.splice(idx, 1);
        return true;
      }
      return false;
    },

    affectVisual: function (hide, pNode, nodeId) {
      var self = this;

      for (var i in pNode.childrens) {
        var chs = pNode.childrens[i];
        if (hide === true) {
          $('#t' + chs._id).hide();
          if (chs.childrens.length > 0) {
            self.affectVisual(true, chs, chs._id);
          }
        }
        else {
          $('#t' + chs._id).show();

          if (chs.childrens.length > 0) {
            var isChildrenCollapsed = self.isCollapsed(chs._id);
            if (isChildrenCollapsed === false)
              self.affectVisual(false, chs, chs._id);
            else if (isChildrenCollapsed >= 0 || isChildrenCollapsed === true)
              self.affectVisual(true, chs, chs._id);
          }
        }
      }

      // hide svg
      if (hide === true)
        $("svg[data-source='t" + nodeId + "'").hide();
      else
        $("svg[data-source='t" + nodeId + "'").show();
    },

    affectVisualCat: function (hide, pNode, slug) {
      var self = this;

      for (var i in pNode.subCategories) {
        var chs = pNode.subCategories[i];
        if (hide === true) {
          $('#' + chs.slug).hide();
          if (chs.subCategories.length > 0) {
            self.affectVisual(true, chs, chs.slug);
          }
        }
        else {
          $('#' + chs.slug).show();

          if (chs.subCategories.length > 0) {
            var isChildrenCollapsed = self.isCollapsed(chs._id);
            if (isChildrenCollapsed === false)
              self.affectVisual(false, chs, chs.slug);
            else if (isChildrenCollapsed >= 0 || isChildrenCollapsed === true)
              self.affectVisual(true, chs, chs.slug);
          }
        }
      }

      // hide svg
      if (hide === true)
        $("svg[data-source='" + slug + "'").hide();
      else
        $("svg[data-source='" + slug + "'").show();
    },

    localStorageSave: function (_id, val) {
      if (typeof(localStorage) == "undefined")
        return;

      localStorage['collapse.' + _id] = val;
    }
  }
}]);