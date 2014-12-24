function WaveformDrawer() {
    this.decodedAudioBuffer;
    this.peaks;
    this.canvas;
    this.displayWidth;
    this.displayHeight;
    this.sampleStep = 10;
    this.color = 'black';
    //test

    this.init = function (decodedAudioBuffer, canvas, color) {
        this.decodedAudioBuffer = decodedAudioBuffer;
        this.canvas = canvas;
        this.displayWidth = canvas.width;
        this.displayHeight = canvas.height;
        this.color = color;
        //this.sampleStep = sampleStep;

        // Initialize the peaks array from the decoded audio buffer and canvas size
        this.getPeaks();
    };

    this.max = function max(values) {
        var m = -Infinity;
        for (var i = 0, len = values.length; i < len; i++) {
            var val = values[i];
            if (val > m) {
                m = val;
            }
        }
        return m;
    };
    // Fist parameter : wjere to start vertically in the canvas (useful when we draw several
    // waveforms in a single canvas)
    // Second parameter = height of the sample
    this.drawWave = function (startY, height) {
        var ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.translate(0, startY);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        var width = this.displayWidth;
        var coef = height / (2 * this.max(this.peaks));
        var halfH = height / 2;

        ctx.beginPath();
        ctx.moveTo(0, halfH);
        ctx.lineTo(width, halfH);
        console.log("drawing from 0, " + halfH + " to " + width + ", " + halfH);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(0, halfH);

        for (var i = 0; i < width; i++) {
            var h = Math.round(this.peaks[i] * coef);
            ctx.lineTo(i, halfH + h);
        }
        ctx.lineTo(width, halfH);

        ctx.moveTo(0, halfH);

        for (var j = 0; j < width; j++) {
            var g = Math.round(this.peaks[j] * coef);
            ctx.lineTo(j, halfH - g);
        }

        ctx.lineTo(width, halfH);

        ctx.fill();

        ctx.restore();
    };

    // Builds an array of peaks for drawing
    // Need the decoded buffer
    // Note that we go first through all the sample data and then
    // compute the value for a given column in the canvas, not the reverse
    // A sampleStep value is used in order not to look each indivudal sample
    // value as they are about 15 millions of samples in a 3mn song !
    this.getPeaks = function () {
        var buffer = this.decodedAudioBuffer;
        var sampleSize = Math.ceil(buffer.length / this.displayWidth);

        console.log("sample size = " + buffer.length);

        this.sampleStep = this.sampleStep || ~~(sampleSize / 10);

        var channels = buffer.numberOfChannels;
        // The result is an array of size equal to the displayWidth
        this.peaks = new Float32Array(this.displayWidth);

        // For each channel
        for (var c = 0; c < channels; c++) {
            var chan = buffer.getChannelData(c);

            for (var i = 0; i < this.displayWidth; i++) {
                var start = ~~(i * sampleSize);
                var end = start + sampleSize;
                var peak = 0;
                for (var j = start; j < end; j += this.sampleStep) {
                    var value = chan[j];
                    if (value > peak) {
                        peak = value;
                    } else if (-value > peak) {
                        peak = -value;
                    }
                }
                if (c > 1) {
                    this.peaks[i] += peak / channels;
                } else {
                    this.peaks[i] = peak / channels;
                }
            }
        }
    };
}
