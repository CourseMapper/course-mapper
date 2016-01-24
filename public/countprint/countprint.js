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

    if (options) {
        if (options.container) {
            containerName = options.container;
        }
        if (options.maxValue) {
            maxValue = options.maxValue
        }
    }

    var containers = document.getElementsByClassName(containerName);
    for (var i = 0; i < containers.length; i++) {
        var container = containers[i];
        container.style.background = createCountPrint(data, maxValue);
    }

    function createCountPrint(data, maxValue) {
        var elementWidth = (100 / data.length);
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