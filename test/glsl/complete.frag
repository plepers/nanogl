
precision highp float;

varying float vFloat;
varying vec4  vVec4;

void main(void){
  gl_FragColor = vec4( vFloat, vVec4.xyz );
}