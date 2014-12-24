function Song(songName, context) {
    // the web audio context
    var audioContext = context;
    // name of the song
    this.name = songName;
    // url of this song
    this.url = "track/" + songName;
    // list of tracks in that song
    this.tracks = [];
    // master volume of this song
    this.volume = 1;
    // elapsed time (since beginning, in seconds (float))
    this.elapsedTimeSinceStart;

    // song is paused ?
    this.paused = true;

    // song is muted ?
    this.muted = false;

    // Recording mix mode ?
    this.recording = false;

    // loop we start again at the beginning of the loop
    this.loopMode = false;
    this.loopStartTime;
    this.loopEndTime;

    // record mix ?
    this.recordMixMode = false;

    // list of decoded audio buffers
    this.decodedAudioBuffers = [];

    // The web audio graph nodes
    // Master volume
    this.masterVolumeNode = context.createGain();
    this.trackVolumeNodes = [];
    this.analyserNode = context.createAnalyser();
    // For saving the mix to a .wav file, it's better to build this node only
    // once and reuse it.
    this.masterRecorderNode = new Recorder(this.masterVolumeNode);
    var recIndex = 0; // for generating name of exorted mix

    // Origin of the web audio graph, useful for start/stop/pause
    this.sampleNodes = [];

    this.addTrack = function (instrument) {
        this.tracks.push(new Track(this.name, instrument));
    };

    // Build the web audio graph
    this.buildGraph = function () {
        var sources = [];

        for (var i = 0; i < this.decodedAudioBuffers.length; i++) {
            var sample = this.decodedAudioBuffers[i];

            // each sound sample is the  source of a graph
            sources[i] = context.createBufferSource();
            sources[i].buffer = sample;

            // connect each sound sample to a volume node
            this.trackVolumeNodes[i] = context.createGain();
            // set the volume to 0 or 1 depending on the mute/solo buttons
            if (this.tracks[i].muted) {
                // The track's volume is zero
                this.trackVolumeNodes[i].gain.value = 0;
            } else {
                this.trackVolumeNodes[i].gain.value = this.tracks[i].volume;
            }
            // Connect the sound sample to its volume node
            sources[i].connect(this.trackVolumeNodes[i]);

            // Connects all track volume nodes a single master volume node
            this.trackVolumeNodes[i].connect(this.masterVolumeNode);

            // Connect the master volume to an analyzer
            this.masterVolumeNode.connect(this.analyserNode);

            // Plug a recorder node to the master volume node
            // Connect the master recorder node after the analyzer
            //this.masterRecorderNode = new Recorder(this.masterVolumeNode);

            // connect the analyzer to the speakers
            this.analyserNode.connect(context.destination);


        }
        // samples = the sound samples, it is necessary to store them in a
        // variable in order to be able so start/stop/pause the song
        this.sampleNodes = sources;
    };

    this.play = function (startTime) {
        this.buildGraph();

        this.setTrackVolumesDependingOnMuteSoloStatus();

        this.elapsedTimeSinceStart = startTime;

        this.sampleNodes.forEach(function (s) {
            // First parameter is the delay before playing the sample
            // second one is the offset in the song, in seconds, can be 2.3456
            // very high precision !
            s.start(0, startTime);
        });

        this.paused = false;

        // We start recording
        if (this.recordMixMode) {
            this.toggleRecording();
        }
    };

    this.stop = function () {
        if (this.paused === true) return; // cannot stop more than once.

        this.sampleNodes.forEach(function (s) {
            // destroy the nodes
            s.stop(0);
            delete s;
        });

        this.paused = true;

        if (this.recordMixMode) {
            // We stop recording
            this.toggleRecording();
        }
    };

    this.pause = function () {
        if (!this.paused) {
            // if we were not paused, then we stop
            this.stop();
        } else {
            // else we start again from the previous position
            this.play(this.elapsedTimeSinceStart);
        }
    };

    this.saveSongAsWav = function (fileName) {
        this.masterRecorderNode.exportWAV(function (blob) {
            clearLog();
            log("Saved mix!");
            log("file: " + fileName);
            Recorder.forceDownload(blob, fileName);
        });
        // could get mono instead by saying
        // audioRecorder.exportMonoWAV( doneEncoding );
    };

    this.toggleRecording = function (e) {
        if (this.recording) {
            // stop recording
            console.log("stopping recording");
            this.masterRecorderNode.stop();

            // We save the mix when we stop recording
            this.saveSongAsWav(this.name + recIndex++ +".wav");
        } else {
            // start recording
            if (!this.masterRecorderNode)
                return;
            console.log("start recording");
            this.masterRecorderNode.clear();
            this.masterRecorderNode.record();
        }
        this.recording = !this.recording;
    };


    this.setVolume = function (value) {
        this.volume = value;
        this.masterVolumeNode.gain.value = value;
    };

    this.setVolumeOfTrack = function (value, trackNumber) {
        if (this.trackVolumeNodes[trackNumber] !== undefined) {
            this.trackVolumeNodes[trackNumber].gain.value = value;
            this.tracks[trackNumber].volume = value;
        }
    };

    // load all sound samples asyncrhonously
    this.getUrlsOfTracks = function () {
        // the buffer loader class requires an array of urls, let's build
        // this array from all tracks' urls
        var urls = [];
        this.tracks.forEach(function (track) {
            urls.push(track.url);
        });

        return urls;
    };

    this.getDuration = function () {
        if (this.decodedAudioBuffers !== undefined) {
            return this.decodedAudioBuffers[0].duration;
        }
        return undefined;
    };

    this.getNbTracks = function () {
        return this.tracks.length;
    };

    this.setDecodedAudioBuffers = function (buffers) {
        this.decodedAudioBuffers = buffers;

        for (var i = 0; i < this.tracks.length; i++) {
            this.tracks[i].decodedBuffer = this.decodedAudioBuffers[i];
        }
    };

    this.toggleLoopMode = function () {
        this.loopMode = !this.loopMode;
    };

    this.toggleMute = function () {
        this.muted = !this.muted;

        if (this.muted) {
            this.masterVolumeNode.gain.value = 0;
        } else {
            // restore volume
            this.masterVolumeNode.gain.value = this.volume;
        }
    };

    this.togglePause = function () {
        this.paused = !this.paused;
    };

    this.toggRecordMixMode = function () {
        this.recordMixMode = !this.recordMixMode;
    };

    this.setTrackVolumesDependingOnMuteSoloStatus = function () {
        var thereIsSolo = false;
        var nbTracks = this.getNbTracks();

        // Check if there is at least one track with solo enabled
        for (var i = 0; i < nbTracks; i++) {
            if (this.tracks[i].solo) {
                thereIsSolo = true;
                break;
            }
        }

        // if there is at least one solo track, all solo tracks have volume to 1, other to zero
        if (thereIsSolo) {
            for (i = 0; i < nbTracks; i++) {
                if (this.tracks[i].solo) {
                    this.trackVolumeNodes[i].gain.value = this.tracks[i].volume;
                } else {
                    this.trackVolumeNodes[i].gain.value = 0;
                }
            }
            return;
        }

        // If we are here that means there were no track in solo mode
        // Just look if tracks are muted or not
        for (i = 0; i < nbTracks; i++) {
            if (this.tracks[i].muted) {
                // track is not muted
                this.trackVolumeNodes[i].gain.value = 0;
            } else {
                this.trackVolumeNodes[i].gain.value = this.tracks[i].volume;
            }
        }
    };
}
