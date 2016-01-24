function loadCss(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}

function CountPrint(data, options) {
    loadCss('countprint.css');
    var self = this;
    var elementWidth = (data && data.length > 0) ? (100 / data.length) : 0;
    var colorful = options.colorful;
    var container = document.getElementsByClassName(options.container)[0];
    container.style.background = getHeatmap(data, options.maxValue);
    var tooltip = document.getElementsByClassName(options.tooltip)[0];

    // Attach tooltip hover event
    container.onmousemove = function (e) {
        var rect = container.getBoundingClientRect();
        var xPos = e.clientX;
        var yPos = rect.top - 23;
        tooltip.style.left = (xPos) + 'px';
        tooltip.style.top = (yPos) + 'px';
        tooltip.innerText = getHoveredElementNumber(rect, e);
    };

    container.onclick = function (e) {
        if (self.onCountSelected) {
            var rect = container.getBoundingClientRect();
            var count = getHoveredElementNumber(rect, e);
            self.onCountSelected(count);
        }
    };

    function getHoveredElementNumber(rect, e) {
        var scrollLeft = document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft;

        var elementLeft = rect.left + scrollLeft;

        var xPos = 0;
        if (document.all) { //detects using IE
            xPos = e.clientX + scrollLeft - elementLeft; //event not evt because of IE
        }
        else {
            xPos = e.pageX - elementLeft;
        }
        var progress = xPos / rect.width;
        // Compute number
        return Math.floor((progress / elementWidth) * 100 + 1);
    }

    function getHeatmap(data, maxValue) {
        var background = '';
        for (var i = 0; i < data.length; i++) {
            var heat = data[i] / maxValue;
            var color = percentToHSLColor(heat);
            var colorStop = elementWidth * (i + 1);
            background += 'linear-gradient(to right, ' + color + ' ' + colorStop + '%, transparent 0%),';
        }
        return background;
    }

    /*
     *  Compute the HSL color value.
     *
     **/
    function percentToHSLColor(value) {
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
}