
precision highp float;

varying vec4 vColor;
varying vec2 vTexCoord;

void main(void){
  gl_FragColor = vec4(vColor.rg, vTexCoord.r, 1.0 );
}