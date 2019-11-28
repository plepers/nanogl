precision highp float;



#if __VERSION__ == 300
  #define IN in
  #define OUT out
#else
  #define IN attribute
  #define OUT varying
#endif


IN vec3 aPosition;

void main( void ){
  gl_Position = vec4( aPosition, 1.0 );
}