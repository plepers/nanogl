var FSGeom = require( './FSGeom' )

var expect  = require( 'expect.js' );

var cvs = null,
    gl = null;

var glSize = 64;
var fsgeom = null;

var ctest32 = new Uint32Array( 1 )
var ctest8888 = new Uint8Array( ctest32.buffer )


function initGL(){
  cvs = document.createElement( 'canvas' );
  cvs.width = glSize;
  cvs.height = glSize;

  cvs.style.width = glSize*4+'px'
  cvs.style.height = glSize*4+'px'

  document.body.appendChild( cvs )

  var opts = {
    alpha :                   true,
    depth :                   true,
    stencil :                 true,
    antialias :               true,
    premultipliedAlpha :      true,
    preserveDrawingBuffer :   false,
    preferLowPowerToHighPerformance :  true,
    failIfMajorPerformanceCaveat :  false
  }

  gl = cvs.getContext( 'webgl', opts ) || cvs.getContext( 'experimental-webgl', opts ) || cvs.getContext( 'webgl');
  gl.viewport( 0,0,glSize, glSize )
  gl.clearColor( 0, 0, 0, 1)
  gl.clear( gl.COLOR_BUFFER_BIT )

  fsgeom = new FSGeom( gl );

}

function getContext(){
  if( ! gl )
    initGL();
  return gl;
}


function getPixel(x, y){
  var res = new Uint8Array( 4 )
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, res );
  return res;
}

function testPixel(x, y, rgba){
  var TOLERANCE = 2;
  var r = (rgba >>> 16 ) & 0xFF
  var g = (rgba >>> 8 ) & 0xFF
  var b = rgba & 0xFF
  var a = (rgba >>> 24 ) & 0xFF
  var res = getPixel( x, y );

  if( (Math.abs( r-res[0] ) > TOLERANCE) || (Math.abs( g-res[1] ) > TOLERANCE) || (Math.abs( b-res[2] ) > TOLERANCE) || (Math.abs( a-res[3] ) > TOLERANCE)){

    ctest8888[3] = res[3];
    ctest8888[2] = res[0];
    ctest8888[1] = res[1];
    ctest8888[0] = res[2];
    var hex = '0x' + ctest32[0].toString(16)
    var tex = '0x' + rgba.toString(16)
    expect( hex ).to.equal( tex );
  }

}

function drawProgram( p ){

  gl.clear( gl.COLOR_BUFFER_BIT )
  p.bind()
  fsgeom.bind( p );
  fsgeom.render()
}

function assertNoError(){
  expect( gl.getError() ).to.equal( 0 );
}
function bindScreen(){
  gl.bindFramebuffer( gl.FRAMEBUFFER, null );
  gl.viewport( 0,0,glSize, glSize )
}

module.exports = {
  getContext :    getContext,
  glSize :        glSize,
  getPixel :      getPixel,
  testPixel :     testPixel,
  fsgeom :        fsgeom,
  drawProgram :   drawProgram,
  assertNoError : assertNoError,
  bindScreen:     bindScreen
}
