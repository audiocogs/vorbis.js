vorbis.js
======

A Vorbis audio decoder for [aurora.js](https://github.com/audiocogs/aurora.js), ported using Emscripten.

## Browser usage

You can either use [Browserify](http://browserify.org) to build your project using the Node module
system, or download standalone versions of [aurora.js](https://github.com/audiocogs/aurora.js/releases), 
[ogg.js](https://github.com/audiocogs/ogg.js/releases), and [vorbis.js](https://github.com/audiocogs/vorbis.js/releases)
to include as `<script>` tags on your HTML page.

See the [Aurora.js docs](http://github.com/audiocogs/aurora.js/wiki) for details on using Aurora.js.

## Node usage

Install using `npm`:

    npm install av vorbis.js

Register codecs and play a file:

```javascript
var AV = require('av');
require('vorbis.js'); // and any other codecs you want...

AV.Player.fromFile('filename.ogg').play();
```

In node, requiring `vorbis.js` automatically loads the `ogg.js` demuxer.

See the [Aurora.js docs](http://github.com/audiocogs/aurora.js/wiki) for more details.

## Building from source

1. Install [Emscripten](https://github.com/kripken/emscripten/wiki/Emscripten-SDK).
2. Clone git submodules
3. Run `npm install` to install dependencies
4. Run `make libvorbis` to configure and build libogg and the C wrapper. Run this again whenever you make changes to the C wrapper or a new version of libogg is released.
5. Run `make browser` to generate a browser version of vorbis.js, or use browserify to build your application.

## License

libvorbis is available under its original license, and the JavaScript and C wrapper code in this repo
for Aurora.js is licensed under MIT.
