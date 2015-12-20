var Program = require( '../../nanogl' ).Program;
var expect  = require( 'expect.js' );

var testContext = require( '../utils/TestContext' );
var gl = testContext.getContext();



describe( "Program", function(){

  it( "should be exported in nanogl namespace", function(){

    expect( Program ).to.be.ok( );

  });

  it( "constructor should return instance", function(){

    var p = new Program( gl );
    expect( p ).to.be.ok( );
    expect( p.gl ).to.be.ok( );

  });


  it( "should compile simple", function(){

    var vert = require( '../glsl/simple.vert')
    var frag = require( '../glsl/simple.frag')

    var p = new Program( gl );
    p.compile( vert, frag );

    testContext.assertNoError();

  });

  it( "should compile complex", function(){

    var vert = require( '../glsl/complete.vert')
    var frag = require( '../glsl/complete.frag')

    var p = new Program( gl );
    p.compile( vert, frag );

  });


  describe( "should set float uniform", function(){

    var vert = require( '../glsl/test_ufloat.vert')
    var frag = require( '../glsl/test_ufloat.frag')

    var p = new Program( gl );
    p.compile( vert, frag );


    it( "with helper arguments", function(){
      p.bind()

      p.uFloat( .5 );

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF7FFF40 )
    });

    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5])
      p.uFloat( val );

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF7FFF40 )
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform1f( p.uFloat(), .5 )

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF7FFF40 )
    });

  });





  describe( "should set vec3 uniform", function(){

    var vert = require( '../glsl/test_uvec3.vert')
    var frag = require( '../glsl/test_uvec3.frag')

    var p = new Program( gl );
    p.compile( vert, frag );


    it( "with helper arguments", function(){

      p.bind()
      p.uVec3( .5, 1, .25 );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF7FFF40 )
    });

    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5, 1, .25 ])
      p.uVec3( val );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF7FFF40 )
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform3f( p.uVec3(), 1, .5, .25 )

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFFFF7F40 )
    });

  });



  describe( "should set vec3 Array uniform", function(){

    var vert = require( '../glsl/test_uvec3_array.vert')
    var frag = require( '../glsl/test_uvec3_array.frag')

    var p = new Program( gl );
    p.compile( vert, frag );



    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5, .25, 2 , .5, 1, .25 ])
      p.uVec3( val );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF40407F )
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform3fv( p.uVec3(), [1, .25, 2 , .5, 1, .125] )

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF7F4040 )
    });

  });



});