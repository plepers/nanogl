

import Sampler from '../sampler'
import Texture2D from '../texture-2d'
import Program from '../program'
var expect  = require( 'expect.js' );

var when = require( 'when' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();

function loadImage( img, src ){
  var def = when.defer()
  img.onload = function(){
    def.resolve( img );
  }
  img.src = src;
  return def.promise;
}

var mireRGB, mireRGBA;
var filltex, filltex16;

describe( "Sampler @WEBGL2", function(){

  before(function() {
    var vert = require( './glsl/filltex.vert')
    var frag = require( './glsl/filltex.frag')
    filltex = new Program( gl );
    filltex.compile( vert, frag, "#define UV_MULT 2.0" );

    filltex16 = new Program( gl );
    filltex16.compile( vert, frag, "#define UV_MULT 17.0" );

    mireRGB  = document.createElement( 'img' );
    mireRGBA = document.createElement( 'img' );
    return when.all( [
      loadImage( mireRGB, 'base/test/assets/mireRGB.png' ),
      loadImage( mireRGBA, 'base/test/assets/mireRGBA.png' ),
    ]);
  });

  after( function(){
    filltex.dispose()
    filltex16.dispose()
  })




  it( "should be exported in nanogl namespace", function(){
    expect( Sampler ).to.be.ok( );
  });

  it( "creation should leave clean gl state", function(){
    var tex = new Sampler( gl );
    testContext.assertNoError();
    tex.dispose()
  });


  it( "dispose should leave clean gl state", function(){
    var tex = new Sampler( gl );
    tex.dispose()
    testContext.assertNoError();
  });



  it( "should render various filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    var sampler = new Sampler( gl )

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    sampler.bind( 0 )

    // NEAREST
    sampler.setFilter( false, false, false )
    sampler.clamp()
    
    testContext.drawProgram( filltex );
    testContext.testPixel( 16, 3, 0xFFee0000 )
    testContext.testPixel( 48, 3, 0xFF101010 )
    
    // LINEAR
    sampler.setFilter( true, false, false )

    testContext.drawProgram( filltex );
    testContext.testPixel( 16, 3, 0xFF955900 )
    testContext.testPixel( 48, 3, 0xFF630A0A )

    // 16 test
    // filltex16.bind()
    // gl.uniform1i( filltex16.tTex(), 0 );

    // tex.setFilter( false, false, false )
    // tex.setRepeat( false )
    // testContext.drawProgram( filltex16 );
    // testContext.testPixel( 0, 0, 0xFF00EE00 )

    // MIPMAP
    gl.generateMipmap( gl.TEXTURE_2D, tex.id );
    sampler.setFilter( false, true, false )
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xFF7b4004 )
    testContext.testPixel( 2, 0, 0xFF777700 )


    // MIPMAP LINEAR
    sampler.setFilter( false, true, true )
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xFF794209 )
    testContext.testPixel( 2, 0, 0xFF767405 )

    // LINEAR MIPMAP LINEAR
    sampler.setFilter( true, true, true )
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xff794509 )
    testContext.testPixel( 2, 0, 0xff756c0c )

    testContext.assertNoError();

    gl.bindSampler( 0, null );
  });





});
