#version 300 es
precision highp float;

out vec4 color;

layout(std140,column_major) uniform BlockA {
  mat4 uMat4;
  float uFloat;
};

uniform BlockB {
  mat4 uMat4;
  float uFloat;
} BlockBNS;


void main(void){
  color = vec4(uFloat, BlockBNS.uFloat, 1.0, 1.0 );
}