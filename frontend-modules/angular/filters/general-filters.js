app.filter('capitalize', function () {
  return function (input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }) : '';
  }
});

app.filter('base64Encode', function () {
  return function (input, all) {
    return (!!input) ? Base64.encode(input) : '';
  }
});

app.filter('base64Decode', function () {
  return function (input, all) {
    return (!!input) ? Base64.decode(input) : '';
  }
});

app.filter('unsafe', function ($sce) {
  return $sce.trustAsHtml;
});

app.filter('trustUrl', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
});

app.filter('trustHtml', function ($sce) {
  return function(html) {
    return $sce.trustAsHtml(html);
  };
});

app.filter('cut', function () {
  return function (value, wordwise, max, tail) {
    if (!value) return '';

    max = parseInt(max, 10);
    if (!max) return value;
    if (value.length <= max) return value;

    value = value.substr(0, max);
    if (wordwise) {
      var lastspace = value.lastIndexOf(' ');
      if (lastspace != -1) {
        //Also remove . and , so its gives a cleaner result.
        if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
          lastspace = lastspace - 1;
        }
        value = value.substr(0, lastspace);
      }
    }

    return value + (tail || ' …');
  };
});