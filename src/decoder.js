var AV = require('av');
var Vorbis = require('../build/libvorbis.js');

var VorbisDecoder = AV.Decoder.extend(function() {
  AV.Decoder.register('vorbis', this);
  AV.Decoder.register('vrbs', this);
    
  this.prototype.init = function() {
    this.buflen = 4096;
    this.buf = Vorbis._malloc(this.buflen);
    this.headers = 1;
    
    this.outlen = 4096;
    this.outbuf = Vorbis._malloc(this.outlen << 2);
    
    this.vorbis = Vorbis._VorbisInit(this.outbuf, this.outlen);
    
    var self = this;
    var offset = self.outbuf >> 2;
    
    this.callback = Vorbis.Runtime.addFunction(function(len) {
      var samples = Vorbis.HEAPF32.subarray(offset, offset + len);
      self.emit('data', new Float32Array(samples));
    });
  };
  
  this.prototype.readChunk = function() {
    if (!this.stream.available(1))
      throw new AV.UnderflowError();
        
    var list = this.stream.list;
    var packet = list.first;
    list.advance();
    
    if (this.buflen < packet.length) {
      this.buf = Vorbis._realloc(this.buf, packet.length);
      this.buflen = packet.length;
    }
    
    Vorbis.HEAPU8.set(packet.data, this.buf);
    var status = 0;
    if ((status = Vorbis._VorbisDecode(this.vorbis, this.buf, packet.length, this.callback)) !== 0)
      throw new Error("Vorbis decoding error: " + status);
  };
  
  this.prototype.destroy = function() {
    Vorbis._free(this.buf);
    Vorbis._free(this.outbuf);
    Vorbis._VorbisDestroy(this.vorbis);
    Vorbis.Runtime.removeFunction(this.callback);
    
    this.buf = null;
    this.outbuf = null;
    this.vorbis = null;
  };
});

module.exports = VorbisDecoder;
