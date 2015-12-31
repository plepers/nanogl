var Program = require( '../../nanogl' ).Program;
var Fbo = require( '../../nanogl' ).Fbo;
var expect  = require( 'expect.js' );

var testContext = require( '../utils/TestContext' );
var gl = testContext.getContext();



describe( "Fbo", function(){

  it( "should be exported in nanogl namespace", function(){
    expect( Fbo ).to.be.ok( );
  });


  it( "color only creation should leave clean state", function(){
    var fbo = new Fbo( gl, 32, 32 );
    testContext.assertNoError();
  });

  it( "full creation should leave clean state", function(){
    var fbo = new Fbo( gl, 32, 32, {
      stencil : true,
      depth : true
    } );
    testContext.assertNoError();
  });

    it( "should be valid", function(){
    var fbo = new Fbo( gl, 32, 32, {
      stencil : true,
      depth : false
    } );
    expect( fbo.valid ).to.be.ok()
    testContext.assertNoError();
    fbo.dispose();
  });


  it( "should dispose correctly", function(){
    var fbo = new Fbo( gl, 32, 32, {
      stencil : true,
      depth : false
    } );
    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });


  it( "should set flags correctly", function(){
    var fbo = new Fbo( gl, 32, 32 )
    expect( fbo.flags ).to.equal( 0 );
    fbo.dispose();

    fbo = new Fbo( gl, 32, 32, {
      depth : true
    } )
    expect( fbo.flags ).to.equal( 1 );
    fbo.dispose();

    fbo = new Fbo( gl, 32, 32, {
      stencil : true
    } )
    expect( fbo.flags ).to.equal( 2 );
    fbo.dispose();

    fbo = new Fbo( gl, 32, 32, {
      stencil : true,
      depth : true
    } )
    expect( fbo.flags ).to.equal( 3 );
    fbo.dispose();
  });



  it( "should bind correctly", function(){
    var fbo = new Fbo( gl, 32, 32, {
      stencil : true,
      depth : false
    } );
    fbo.bind();
    testContext.assertNoError();
    fbo.dispose();
  });


  it( "should pass render test A", function(){
    var vert, frag, p;

    var fbo = new Fbo( gl, 32, 32 );


    // draw 0xFF7F0000 to Fbo color
    vert = require( '../glsl/test_uvec3.vert')
    frag = require( '../glsl/test_uvec3.frag')
    p = new Program( gl );
    p.compile( vert, frag );
    p.bind()
    p.uVec3( .5, 0, 0 );


    fbo.bind();
    testContext.drawProgram( p );

    // draw Fbo to screen
    testContext.bindScreen();

    vert = require( '../glsl/filltex.vert')
    frag = require( '../glsl/filltex.frag')
    p = new Program( gl );
    p.compile( vert, frag );
    p.bind()
    fbo.bindColor( p.tTex(), 0 );

    testContext.drawProgram( p );

    // test color
    testContext.testPixel( 0, 0, 0xFF800000 )
    testContext.assertNoError();
    fbo.dispose();
  });


  it( "should fallback when multiple formats", function(){
    var float_texture_ext = gl.getExtension('OES_texture_float');
    var halfFloat = gl.getExtension("OES_texture_half_float")

    var tList =  [ gl.FLOAT, halfFloat ? halfFloat.HALF_FLOAT_OES : gl.UNSIGNED_BYTE, gl.UNSIGNED_BYTE ];

    var fbo = new Fbo( gl, 32, 32, {
      type : tList,
      format : gl.RGBA
    });
    // should always fallback to U8
    expect( tList ).to.contain( fbo.getActualType() )
    testContext.assertNoError();

  })


  it( "should fallback when multiple formats 2", function(){
    var float_texture_ext = gl.getExtension('OES_texture_float');
    var halfFloat = gl.getExtension("OES_texture_half_float")
    var tList =  [ halfFloat ? halfFloat.HALF_FLOAT_OES : gl.FLOAT, gl.FLOAT, gl.UNSIGNED_BYTE ];
    var fbo = new Fbo( gl, 32, 32, {
      type : tList,
      format : gl.RGB
    });
    // expect( fbo.getActualType() ).to.be.equal( halfFloat.HALF_FLOAT_OES )
    // if( float_texture_ext || halfFloat )
    //   expect( fbo.getActualType() ).not.to.be.equal( gl.UNSIGNED_BYTE )
    // else
    //   expect( fbo.getActualType() ).to.be.equal( gl.UNSIGNED_BYTE )

    expect( tList ).to.contain( fbo.getActualType() )
    testContext.assertNoError();

  })



});