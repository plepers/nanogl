precision highp float;

attribute vec2 aPosition;

varying vec2 vTexCoord;

void main( void ){
  gl_Position = vec4( aPosition, 0.0, 1.0 );
  vTexCoord = aPosition*.5+.5;
}