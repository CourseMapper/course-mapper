'use strict';

var SearchQueryBuilder = function (term) {
  var query = {
    $text: {$search: term}
  };

  this.filterByUserId = function (uid) {
    if (!uid) return this;
    query.user = uid;
    return this;
  };

  this.build = function () {
    return query;
  }
};

module.exports = SearchQueryBuilder;