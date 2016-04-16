precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform float uUniform1;
uniform float uUniform2;
uniform float uUniform3;
uniform float uFloat;
uniform vec4 uVec4;
uniform vec2 uVec2Array[4];
uniform mat4 uMat4;

varying float vFloat;
varying vec4  vVec4;


void main( void ){
  gl_Position = uMat4 * vec4( aPosition, 1.0 );
  vFloat = uFloat + uUniform1 + uUniform2 + uUniform3 + uVec2Array[0].x;
  vVec4  = uVec4;
}