
precision highp float;


varying vec2 vTexCoord;

uniform vec3 uVec3;

void main(void){;
  gl_FragColor = vec4( uVec3, 1.0);
}