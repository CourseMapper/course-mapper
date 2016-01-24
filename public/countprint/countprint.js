function loadCss(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}

function CountPrint(data, options) {
    loadCss('countprint.css');
    var containerName = 'countprint';
    var maxValue = 10;
    var elementWidth = (100 / data.length);

    if (options) {
        if (options.container) {
            containerName = options.container;
        }
        if (options.maxValue) {
            maxValue = options.maxValue
        }
    }

    var background = createCountPrint(data, maxValue);
    var containers = document.getElementsByClassName(containerName);

    for (var i = 0; i < containers.length; i++) {
        containers[i].style.background = background;
        containers[i].onmousemove = onContainerClicked;
    }

    function onContainerClicked(evt) {
        var element = this;
        var rect = element.getBoundingClientRect();
        var scrollLeft = document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
        var elementLeft = rect.left + scrollLeft;

        var xPos = 0;
        if (document.all) { //detects using IE
            xPos = event.clientX + scrollLeft - elementLeft; //event not evt because of IE
        }
        else {
            xPos = evt.pageX - elementLeft;
        }
        var progress = xPos / rect.width;
        var page = Math.floor((progress / elementWidth) * 100 + 1);
        console.log(page);
    }

    function createCountPrint(data, maxValue) {
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
     * In this algorithm, the colors corresponding
     * with values are:
     *
     * 0.00 gray    (hsl(0, 0%, 90%))
     * 0.25 cyan    (hsl(180, 100%, 50%))
     * 0.5  green   (hsl(120, 100%, 50%))
     * 0.75 yellow  (hsl(60, 100%, 50%))
     * 1.0  red     (hsl(0, 100%, 50%))
     *
     * */
    function percentToHSLColor(value) {
        var normalizedValue = normalizeValue(value);
        // Use neutral color for 0 values.
        if (normalizedValue === 0) {
            return buildHSL(0, 0, 90);
        }
        var h = (1.0 - normalizedValue) * 240;
        return buildHSL(h, 100, 50);
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