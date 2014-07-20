#!/bin/bash

# configure libogg
cd libogg
if [ ! -f configure ]; then
  # generate configuration script
  ./autogen.sh
  
  # -O20 and -04 cause problems
  # see https://github.com/kripken/emscripten/issues/264
  sed -i '' 's/-O20/-O2/g' configure
  sed -i '' 's/-O4/-O2/g' configure
  
  # finally, run configuration script
  emconfigure ./configure --prefix="`pwd`" --disable-static
fi

# compile libogg
emmake make
emmake make install

cd ..

# configure libvorbis
dir=`pwd`
cd libvorbis
if [ ! -f configure ]; then
  # generate configuration script
  # disable running configure automatically
  sed -i '' 's/$srcdir\/configure/#/' autogen.sh
  ./autogen.sh
  
  # -O20 and -04 cause problems
  # see https://github.com/kripken/emscripten/issues/264
  sed -i '' 's/-O20/-O2/g' configure
  sed -i '' 's/-O4/-O2/g' configure
  
  # disable oggpack_writealign test
  sed -i '' 's/$ac_cv_func_oggpack_writealign/yes/' configure
  
  # finally, run configuration script
  mkdir -p build
  emconfigure ./configure --prefix="$dir/libvorbis/build" --disable-oggtest --disable-static --with-ogg=$dir/libogg --with-ogg-libraries=$dir/libogg/lib
fi

# compile libvorbis
EMCC_CFLAGS="--ignore-dynamic-linking" emmake make
emmake make install

# compile wrapper
cd ..
mkdir -p build
emcc -O3 -s RESERVED_FUNCTION_POINTERS=50 -s EXPORTED_FUNCTIONS="['_VorbisInit', '_VorbisHeaderDecode', '_VorbisGetChannels', '_VorbisGetSampleRate', '_VorbisGetNumComments', '_VorbisGetComment', '_VorbisDecode', '_VorbisDestroy']" -I libogg/include -Llibogg/lib -logg -I libvorbis/include -Llibvorbis/build/lib -lvorbis src/vorbis.c -o build/libvorbis.js
echo "module.exports = Module" >> build/libvorbis.js
