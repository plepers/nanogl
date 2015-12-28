
var TextureLoader = require( '../../texture-loader' );

var Texture = require( '../../nanogl' ).Texture;
var Program = require( '../../nanogl' ).Program;
var expect  = require( 'expect.js' );

var testContext = require( '../utils/TestContext' );
var gl = testContext.getContext();

var filltex;

describe( "TextureLoader", function(){

  before(function() {
    vert = require( '../glsl/filltex.vert')
    frag = require( '../glsl/filltex.frag')
    filltex = new Program( gl );
    filltex.compile( vert, frag, "#define UV_MULT 2.0" );

    filltex16 = new Program( gl );
    filltex16.compile( vert, frag, "#define UV_MULT 17.0" );

    mireRGB  = document.createElement( 'img' );
    mireRGBA = document.createElement( 'img' );

  });

  after( function(){
    filltex.dispose()
    filltex.dispose()
  })



  it( "should be", function(){
    expect( TextureLoader ).to.be.ok( );
  });

  it( "should load", function( done ){
    var tex = new Texture( gl );

    TextureLoader.load( tex, 'assets/mireRGB.png' ).then( function( tex ){
      expect( tex ).to.be.ok();
      done();
    })

  });



  it( "should reject 404", function( done ){
    var tex = new Texture( gl );

    TextureLoader.load( tex, 'assets/404.png' ).then(
      function( tex ){
        expect().fail()
      },
      function( tex ){
        expect( tex ).to.be.ok();
        done();
      })

  });

  it( "should cancel previous loader", function( done ){
    var tex = new Texture( gl );

    TextureLoader.load( tex, 'assets/mireRGB.png' ).then(
      function( tex ){
        expect().fail( 'should not resolve' );
      },
      function( tex ){
        expect( tex ).to.be.ok();
      })


    TextureLoader.load( tex, 'assets/mireRGBA.png' ).then(
      function( tex ){
        done();
      },
      function( tex ){
        expect().fail( 'should not reject');
      })

  });


});
