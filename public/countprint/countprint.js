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
            var color = percentToColor(heat);
            var colorStop = elementWidth * (i + 1);
            background += 'linear-gradient(to right, ' + color + ' ' + colorStop + '%, transparent 0%),';
        }
        return background;
    }

    function percentToColor(value) {
        var h = (1.0 - normalizeValue(value)) * 240;
        var s = 100;
        var l = 50;
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