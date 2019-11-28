#version 300 es
precision highp float;

in vec3 aPosition;

layout(std140,column_major) uniform BlockA {
  mat4 uMat4;
  float uFloat;
};

uniform BlockB {
  mat4 uMat4;
  float uFloat;
} BlockBNS;


void main( void ){
  vec4 p = vec4( aPosition, 1.0 );

  gl_Position = uMat4 * (BlockBNS.uMat4 * p);
}