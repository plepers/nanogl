
precision highp float;


varying vec2 vTexCoord;

uniform float uFloat;

void main(void){;
  gl_FragColor = vec4(uFloat, uFloat*2.0, uFloat*.5, 1.0);
}