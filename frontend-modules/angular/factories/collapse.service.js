app.factory('collapseService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
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
                    // true means hide
                    return true;
                } else {
                    // show back
                    this.collapsed.splice(idx, 1);
                    return false;
                }
            },

            setCollapse: function (nodeId) {
                var idx = this.isCollapsed(nodeId);
                if (idx === false) {
                    // hidden, now set it to hide
                    this.collapsed.push(nodeId);
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
                    return true;
                }
                return false;
            },

            affectVisual: function (hide, pNode, nodeId) {
                var self = this;

                for (var i in pNode.childrens) {
                    var chs = pNode.childrens[i];
                    if (hide !== false) {
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
                            else
                                self.affectVisual(true, chs, chs._id);
                        }
                    }
                }

                // hide svg
                if (hide === false)
                    $("svg[data-source='t" + nodeId + "'").show();
                else
                    $("svg[data-source='t" + nodeId + "'").hide();
            }

        }
    }
]);