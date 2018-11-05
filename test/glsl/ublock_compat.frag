

precision highp float;


#if __VERSION__ == 300
  
  #define IN in
  #define texture2D(a,b) texture( a, b )
  out vec4 FragColor;
#else
  #define IN varying
  #define FragColor gl_FragColor
#endif


#if __VERSION__ == 300

// 300
layout(std140,column_major) uniform TonemapBlock {
  float exposure;
  float gamma;
} Tonemap;


#else

// 100
uniform struct TonemapBlock {
  float exposure;
  float gamma;
} Tonemap;

#endif

void main(void){;
  FragColor = vec4( Tonemap.exposure + Tonemap.gamma );
}