
precision highp float;


varying vec2 vTexCoord;

uniform vec3 uVec3[2];

void main(void){;
  gl_FragColor = vec4( uVec3[0] * uVec3[1], 1.0);
}