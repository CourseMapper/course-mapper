'use strict';

function CountMap(options) {
  var self = this;
  var container = $(options.container);

  this.buildHeatMap = function (options) {
    container.empty();
    var segments = valuesToSegments(options.segments, options.segmentKey, options.totalSegments);
    var hasSegments = (segments && segments.length > 0);
    if (!hasSegments) {
      return;
    }
    var elementWidth = (100 / segments.length);
    for (var i = 0; i < segments.length; i++) {
      var percentage = (segments[i] / options.maxValue);
      var div = $('<div></div>');
      div.css('background', percentToHSLColor(percentage, options.colorful));
      div.css('width', elementWidth + '%');
      div.css('height', '100%');
      div.css('margin-left', (i * elementWidth) + '% ');
      div.css('position', 'absolute');

      // Set data attribute to element number
      div.attr('title', 'Page: ' + (i + 1).toString() + '\nAnnotations: ' + segments[i]);
      div.attr('number', (i + 1));
      // Wire events
      div.click(function () {
        if (self.itemClicked) {
          self.itemClicked(this.getAttribute('number'));
        }
      });

      div.hover(function () {
        $(this).css('cursor', 'pointer');
      }, function () {
        $(this).css('cursor', 'auto');
      });
      container.append(div);
    }
  };

  /*
   *  Compute the HSL color value.
   *
   **/
  function percentToHSLColor(value, colorful) {
    var normalizedValue = normalizeValue(value);

    var h, l, s;
    if (colorful === true) {
      h = (1.0 - normalizedValue) * 320;
      l = 120 * normalizedValue;
      s = normalizedValue ? 50 : 90;
    }
    else {
      h = 202;
      l = 52;
      s = 100 - normalizedValue * 50;
    }
    return buildHSL(h, l, s);
  }

  function buildHSL(h, s, l) {
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  }

  function normalizeValue(value) {
    if (!value) {
      return 0.0;
    } else if (value > 1.0) {
      return 1.0;
    } else if (value < 0.0) {
      return 0.0;
    }
    return value;
  }

  function valuesToSegments(items, selector, totalItems) {
    var kvpList = _.reduce(items, function (result, value, k) {
      var i = value[selector];
      if (!result[i]) result[i] = 0;
      result[i] += 1;
      return result;
    }, {});

    var segments = [];
    segments.length = totalItems;
    for (var i = 0; i < segments.length; i++) {
      var index = i + 1;
      if (kvpList[index]) {
        segments[i] = kvpList[index];
      }
      else {
        segments[i] = 0;
      }
    }
    return segments;
  }
}