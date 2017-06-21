MT5 - A multitrack HTML5 Player
===========
Online demo at http://mainline.i3s.unice.fr, give a look also at the user's [manual and documentation](http://miageprojet2.unice.fr/Intranet_de_Michel_Buffa/MT5%2c_multitrack_player_for_musicians).

MT5 is a sort of jukebox like multitrack player that has been developed for musicians who like to study a song track by track, or mute some tracks and play along it.

In order to run it, you will need nodeJS and some node modules. Just run `npm install` to download the modules.

Then look at the `server.js` file, you may want to change the default port value. Look at lines:

```
// Config
var PORT = process.env.PORT,
TRACKS_PATH = './client/multitrack/',
addrIP = process.env.IP;

And change port and IP, for example, use something like:
// Config
var PORT = '8081',
TRACKS_PATH = './client/multitrack/',
addrIP = '127.0.0.1';
```

Then run `npm install` and then `node server.js` and open `http://localhost:8081` on a web browser. Then select any song in the drop down menu.

The multitrack songs are located in the directory assigned to `TRACK_PATH`, this is by default `client/multitrack`, and a multitrack song is just a directory with files in it, corresponding to the tracks. Just create new dir with mp3, ogg, wav files and reload the page, you will be able to play new songs.

MT5 has been kept simple. It runs on any modern browser, desktop or mobile, (that means all except IE which promised web audio support for its version 12).

The dirty work of managing the GUI, events, etc is done in `sound.js`... the main clock is in there too. We use requestAnimationFrame in order to measure time by intervals of about 1/60th of a second. Deltas are measured there in order to know "where we are in a song", and be able to jump or restart after a stop or a pause.

Web audio pausing or jumping in a song is way unnatural as the AudioBufferSource nodes can be started and stopped only once. This "fire and forget" approach chosen in web audio for these particular nodes means that we need to rebuild partially the web audio graph at each pause or jump. The play/pause/jump and building of the audio graph is done in the song.js file.


I will try to complete this documentation, do not hesitate to contact me at micbuffa at gmail dot com.

There is an online demo at http://mainline.i3s.unice.fr
