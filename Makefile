build/libvorbis.js:
	./compileVorbis.sh
	
libvorbis: build/libvorbis.js
		
browser: src/*.js build/libvorbis.js
	mkdir -p build/
	./node_modules/.bin/browserify \
		--global-transform browserify-shim \
		--bare \
		--no-detect-globals \
		. \
		> build/vorbis.js
		
clean:
	cd libvorbis && make clean
	cd libogg && make clean
	rm -f libvorbis/configure
	rm -f libogg/configure
	rm -rf build

.PHONY: libvorbis clean browser
