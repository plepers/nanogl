
precision highp float;

uniform sampler2D tTex;

varying vec2 vTexCoord;

void main(void){
  gl_FragColor = texture2D( tTex, vTexCoord );
}