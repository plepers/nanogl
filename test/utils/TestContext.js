var FSGeom = require( './FSGeom' )

var expect  = require( 'expect.js' );

var cvs = null,
    gl = null;

var glSize = 256;
var fsgeom = null;

function initGL(){
  cvs = document.createElement( 'canvas' );
  cvs.width = glSize;
  cvs.height = glSize;

  document.body.appendChild( cvs )

  var opts = {
    alpha :                   true,
    depth :                   true,
    stencil :                 true,
    antialias :               true,
    premultipliedAlpha :      true,
    preserveDrawingBuffer :   false,
    preferLowPowerToHighPerformance :  false,
    failIfMajorPerformanceCaveat :  false
  }

  gl = cvs.getContext( 'webgl', opts );
  gl.viewport( 0,0,glSize, glSize )
  gl.clearColor( 1, 0, 0, 1)
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
  var r = (rgba >>> 16 ) & 0xFF
  var g = (rgba >>> 8 ) & 0xFF
  var b = rgba & 0xFF
  var a = (rgba >>> 24 ) & 0xFF
  var res = getPixel( x, y );
  expect( res[0] ).to.be( r );
  expect( res[1] ).to.be( g );
  expect( res[2] ).to.be( b );
  expect( res[3] ).to.be( a );
}

function drawProgram( p ){
  p.bind()
  fsgeom.bind( p );
  fsgeom.render()
}

module.exports = {
  getContext :    getContext,
  glSize :        glSize,
  getPixel :      getPixel,
  testPixel :     testPixel,
  fsgeom :        fsgeom,
  drawProgram :   drawProgram
}
