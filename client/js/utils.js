// Prototype for displaying the song time
// use "123.57".toFormattedTime(); or
// var x = 124.567; (x+"").toFormattedTime();

String.prototype.toFormattedTime = function () {
    var sec_num = parseFloat(this, 10); // don't forget the second param
    var h = Math.floor(sec_num / 3600);
    var m = Math.floor((sec_num - (h * 3600)) / 60);
    var s = sec_num - (h * 3600) - (m * 60);

    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s.toFixed(1));
};
