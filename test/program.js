var Program = require( '../nanogl' ).Program;
var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();

Program.debug = true

describe( "Program GLSL1", function(){

  it( "should be exported in nanogl namespace", function(){

    expect( Program ).to.be.ok( );

  });

  it( "constructor should return instance", function(){

    var p = new Program( gl );
    expect( p ).to.be.ok( );
    expect( p.gl ).to.be.ok( );

  });


  it( "should compile simple", function(){

    var vert = require( './glsl/simple.vert')
    var frag = require( './glsl/simple.frag')

    var p = new Program( gl );
    p.compile( vert, frag );

    testContext.assertNoError();

  });

  it( "should compile complex", function(){

    var vert = require( './glsl/complete.vert')
    var frag = require( './glsl/complete.frag')

    var p = new Program( gl );
    p.compile( vert, frag );

    testContext.assertNoError();
  });



  it( "should recompile", function(){

    var p = new Program( gl );
    p.compile(
      require( './glsl/complete.vert'),
      require( './glsl/complete.frag')
    );

    var vert = require( './glsl/test_ufloat.vert'),
        frag = require( './glsl/test_ufloat.frag');
    p.compile(
      vert,
      frag
    );

    testContext.assertNoError();

    p.bind()

    p.uFloat( .5 );

    testContext.drawProgram( p );
    testContext.testPixel( 0, 0, 0xFF80FF40 )

  });


  describe( "should set float uniform", function(){

    var vert = require( './glsl/test_ufloat.vert')
    var frag = require( './glsl/test_ufloat.frag')

    var p = new Program( gl );
    p.compile( vert, frag );


    it( "with helper arguments", function(){
      p.bind()

      p.uFloat( .5 );

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF80FF40 )
    });

    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5])
      p.uFloat( val );

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF80FF40 )
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform1f( p.uFloat(), .5 )

      testContext.drawProgram( p );
      testContext.assertNoError();
      testContext.testPixel( 0, 0, 0xFF80FF40 )
    });

  });




  describe( "should set vec3 uniform", function(){

    var vert = require( './glsl/test_uvec3.vert')
    var frag = require( './glsl/test_uvec3.frag')

    var p = new Program( gl );
    p.compile( vert, frag );


    it( "with helper arguments", function(){

      p.bind()
      p.uVec3( .5, 1, .25 );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF80FF40 )
      testContext.assertNoError();
    });

    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5, 1, .25 ])
      p.uVec3( val );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF80FF40 )
      testContext.assertNoError();
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform3f( p.uVec3(), 1, .5, .25 )

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFFFF8040 )
    });

  });



  describe( "should set vec3 Array uniform", function(){

    var vert = require( './glsl/test_uvec3_array.vert')
    var frag = require( './glsl/test_uvec3_array.frag')

    var p = new Program( gl );
    p.compile( vert, frag );



    it( "with helper vector", function(){
      p.bind()
      var val = new Float32Array([.5, .25, 2 , .5, 1, .25 ])
      p.uVec3( val );

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF404080 )
      testContext.assertNoError();
    });

    it( "with location access", function(){
      p.bind()

      gl.uniform3fv( p.uVec3(), [1, .25, 2 , .5, 1, .125] )

      testContext.drawProgram( p );
      testContext.testPixel( 0, 0, 0xFF804040 )
      testContext.assertNoError();
    });

  });


  describe( "should set mat4 uniform", function(){

    var vert = require( './glsl/test_umat4.vert')
    var frag = require( './glsl/test_umat4.frag')

    var p = new Program( gl );
    p.compile( vert, frag );

    var matrix = new Float32Array([
      .5,  0,  0,  0,
      0,   .5, 0,  0,
      0,   0,  .5, 0,
      .25, .25, 0, 1
    ])
    var nullMat = new Float32Array([
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    ])

    it( "with helper vector", function(){
      p.bind()
      p.uMat4( matrix );

      gl.clear( gl.COLOR_BUFFER_BIT );
      testContext.drawProgram( p );
      testContext.testPixel( 23, 23, 0xFF000000 );
      testContext.testPixel( 24, 24, 0xFF8040FF );
      testContext.testPixel( 55, 55, 0xFF8040FF );
      testContext.testPixel( 56, 56, 0xFF000000 );
      testContext.assertNoError();

      p.uMat4( nullMat );
    });

    it( "with location access", function(){
      p.bind()

      gl.uniformMatrix4fv( p.uMat4(), false, matrix )

      gl.clear( gl.COLOR_BUFFER_BIT );
      testContext.drawProgram( p );
      testContext.testPixel( 23, 23, 0xFF000000 );
      testContext.testPixel( 24, 24, 0xFF8040FF );
      testContext.testPixel( 55, 55, 0xFF8040FF );
      testContext.testPixel( 56, 56, 0xFF000000 );
      testContext.assertNoError();
      p.uMat4( nullMat );
    });

  });



});

describe( "@WEBGL2 Program GLSL300", function(){

  it( "should compile simple", function(){

    var vert = require( './glsl300/simple.vert')
    var frag = require( './glsl300/simple.frag')

    var p = new Program( gl );
    var res = p.compile( vert, frag );

    expect( res ).to.be.ok()

    testContext.assertNoError();

  });

  it( "should compile u blocks", function(){

    var vert = require( './glsl300/ublock.vert')
    var frag = require( './glsl300/ublock.frag')

    var p = new Program( gl );
    var res = p.compile( vert, frag );

    expect( res ).to.be.ok()

    testContext.assertNoError();

  });


  it( "should retreive u blocks", function(){

    var vert = require( './glsl300/ublock.vert')
    var frag = require( './glsl300/ublock.frag')

    var p = new Program( gl );
    var res = p.compile( vert, frag );
    p.use()

    expect( res ).to.be.ok()
    expect( p.BlockA ).to.be.ok()
    expect( p.BlockB ).to.be.ok()
    expect( p.uMat4 ).to.be( undefined )

    testContext.assertNoError();

  });
});
