
precision highp float;

varying float vFloat;
varying vec4  vVec4;

uniform sampler2D uTex;

void main(void){
  gl_FragColor = vec4( vFloat, vVec4.xyz ) + texture2D( uTex, vVec4.xy );
}