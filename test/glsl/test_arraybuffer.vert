precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
attribute vec4 aColor;

varying vec2 vTexCoord;
varying vec4 vColor;

void main( void ){
  gl_Position = vec4( aPosition, 1.0 );
  vColor = aColor;
  vTexCoord = aTexCoord;
}