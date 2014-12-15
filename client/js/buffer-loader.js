function BufferLoader(context, urlList, callback, callbackDraw) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = [];
  this.loadCount = 0;
  this.drawSample = callbackDraw;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  console.log('file : ' + url + "loading and decoding");

  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function () {

    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function (buffer) {
        log("Loaded and decoded track " + (loader.loadCount + 1) +
          "/" + loader.urlList.length + "...");

        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;

        // Let's draw this decoded sample
        loader.drawSample(buffer, index);

        //console.log("In bufferLoader.onload bufferList size is " + loader.bufferList.length + " index =" + index);
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function (error) {
        console.error('decodeAudioData error', error);
      }
    );
  };

  request.onprogress = function (e) {
    // e.total - 100%
    // e.value - ?
    if (e.total !== 0) {
      //var percent = (e.loaded * 100) / e.total;

      //console.log("loaded " + percent  + "of song " + index);
      var progress = document.querySelector("#progress" + index);
      progress.value = e.loaded;
      progress.max = e.total;
    }
  };

  request.onerror = function () {
    alert('BufferLoader: XHR error');
  };

  request.send();
};

BufferLoader.prototype.load = function () {
  // M.BUFFA added these two lines.
  this.bufferList = [];
  this.loadCount = 0;
  clearLog();
  log("Loading tracks... please wait...");
  console.log("BufferLoader.prototype.load urlList size = " + this.urlList.length);
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
};
