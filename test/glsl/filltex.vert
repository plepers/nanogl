precision highp float;

#ifndef UV_MULT
  #define UV_MULT 1.0
#endif

attribute vec2 aPosition;

varying vec2 vTexCoord;

void main( void ){
  gl_Position = vec4( aPosition, 0.0, 1.0 );
  vTexCoord = UV_MULT * (aPosition*.5 + .5);
}