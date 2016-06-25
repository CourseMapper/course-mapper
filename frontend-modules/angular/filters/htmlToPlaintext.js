app.filter('htmlToPlaintext', function () {
    return function (text) {
      return angular.element(text).text();
    }
  }
);