precision highp float;

attribute vec3 aPosition;

void main( void ){
  gl_Position = vec4( aPosition, 1.0 );
}