'use strict';

function VideoPulse(params) {
  var pulseInterval = params.interval || 5000;
  var host = params.host;
  var videoId = params.videoId;
  var video = params.mediaElement;
  
  var data = {
    user: params.userId,
    key: videoId
  };

  var signaller = null;

  this.start = function () {
    if (signaller) {
      return;
    }
    signaller = setInterval(beat, pulseInterval);
  };

  this.stop = function () {
    if (signaller) {
      clearInterval(signaller);
      beat();
    }
  };

  var beat = function () {

    data.value = video.currentTime; // update pointer

    var request = new XMLHttpRequest();
    var url = host + '/beats';
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(JSON.stringify(data));
  };
}