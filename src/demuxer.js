var AV = require('av');
var OggDemuxer = require('ogg.js');
var Vorbis = require('../build/libvorbis.js');

// wrap function to convert returned C char pointer to JS string
var VorbisGetComment = Vorbis.cwrap('VorbisGetComment', 'string', ['number', 'number']);

// vorbis demuxer plugin for Ogg
OggDemuxer.plugins.push({
  magic: "\001vorbis",
  
  init: function() {
    this.vorbis = Vorbis._VorbisInit();
    this.buflen = 4096;
    this.vorBuf = Vorbis._malloc(this.buflen);
    this.headers = 3;
    this.headerBuffers = [];
  },

  readHeaders: function(packet) {
    if (this.buflen < packet.length) {
      this.vorBuf = Vorbis._realloc(this.vorBuf, packet.length);
      this.buflen = packet.length;
    }
    
    Vorbis.HEAPU8.set(packet, this.vorBuf);
    if (Vorbis._VorbisHeaderDecode(this.vorbis, this.vorBuf, packet.length) !== 0)
      throw new Error("Invalid vorbis header");
      
    this.headerBuffers.push(packet);
    
    if (--this.headers === 0) {
      this.emit('format', {
        formatID: 'vorbis',
        sampleRate: Vorbis._VorbisGetSampleRate(this.vorbis),
        channelsPerFrame: Vorbis._VorbisGetChannels(this.vorbis),
        floatingPoint: true
      });
      
      var comments = Vorbis._VorbisGetNumComments(this.vorbis);
      this.metadata = {};
      for (var i = 0; i < comments; i++) {
        var comment = VorbisGetComment(this.vorbis, i),
          idx = comment.indexOf('=');
        
        this.metadata[comment.slice(0, idx).toLowerCase()] = comment.slice(idx + 1);
      }
      
      this.emit('metadata', this.metadata);
      
      Vorbis._VorbisDestroy(this.vorbis);
      Vorbis._free(this.vorBuf);
      this.vorbis = null;
      
      for (var i = 0; i < 3; i++)
        this.emit('data', new AV.Buffer(this.headerBuffers[i]));
    }
    
    return this.headers === 0;
  },
  
  readPacket: function(packet) {
    this.emit('data', new AV.Buffer(packet));
  }
});

module.exports = OggDemuxer;
