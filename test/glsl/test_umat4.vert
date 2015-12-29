precision highp float;

attribute vec2 aPosition;

uniform mat4 uMat4;

varying vec2 vTexCoord;

void main( void ){
  gl_Position = uMat4 * vec4( aPosition, 0.0, 1.0 );
  vTexCoord = aPosition*.5+.5;
}