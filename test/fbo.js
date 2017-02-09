var Program = require( '../nanogl' ).Program;
var Fbo = require( '../nanogl' ).Fbo;
var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();



describe( "Fbo", function(){

  it( "should be exported in nanogl namespace", function(){
    expect( Fbo ).to.be.ok( );
  });


  it( "color only creation should leave clean state", function(){
    var fbo = new Fbo( gl );

    testContext.assertNoError();
  });

  it( "full creation should leave clean state", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : true
    } );
    testContext.assertNoError();
  });


  it( "color only init should leave clean state", function(){
    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    testContext.assertNoError();
  });

  it( "full init should leave clean state", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : true
    } );
    fbo.resize( 32, 32 );
    testContext.assertNoError();
  });

  it( "full creation should resize", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : true
    } );
    fbo.resize( 64, 64 );
    expect( fbo.valid ).to.be.ok()
    testContext.assertNoError();
  });

  it( "should be valid", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : false
    } );
    fbo.resize( 32, 32 );
    expect( fbo.valid ).to.be.ok()
    testContext.assertNoError();
    fbo.dispose();
  });


  it( "should dispose correctly", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : false
    } );

    fbo.resize( 32, 32 );
    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });

  it( "should dispose when not init", function(){
    var fbo = new Fbo( gl, {
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
    var fbo = new Fbo( gl )
    expect( fbo.attachment.flags ).to.equal( 0 );
    fbo.dispose();

    fbo = new Fbo( gl, {
      depth : true
    } )
    expect( fbo.attachment.flags ).to.equal( 1 );
    fbo.dispose();

    fbo = new Fbo( gl, {
      stencil : true
    } )
    expect( fbo.attachment.flags ).to.equal( 2 );
    fbo.dispose();

    fbo = new Fbo( gl, {
      stencil : true,
      depth : true
    } )
    expect( fbo.attachment.flags ).to.equal( 3 );
    fbo.dispose();
  });



  it( "should bind correctly", function(){
    var fbo = new Fbo( gl, {
      stencil : true,
      depth : false
    } );

    fbo.resize( 32, 32 );
    fbo.bind();
    testContext.assertNoError();
    fbo.dispose();
  });


  it( "should pass render test A", function(){
    var vert, frag, p;

    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );

    // draw 0xFF7F0000 to Fbo color
    vert = require( './glsl/test_uvec3.vert')
    frag = require( './glsl/test_uvec3.frag')
    p = new Program( gl );
    p.compile( vert, frag );
    p.bind()
    p.uVec3( .5, 0, 0 );


    fbo.bind();
    testContext.drawProgram( p );

    // draw Fbo to screen
    testContext.bindScreen();

    vert = require( './glsl/filltex.vert')
    frag = require( './glsl/filltex.frag')
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


  // =============================================
  //         WEBGL 1 
  // Testing gl.FLOAT depend on optional support
  // result is not predictable -> test case loose
  // =============================================

  it( "@WEBGL1 should fallback when multiple formats", function(){
    var float_texture_ext = gl.getExtension('OES_texture_float');
    var halfFloat = gl.getExtension("OES_texture_half_float")


    var configs = [{
      type   : gl.FLOAT, 
      format : gl.RGB
    }]

    if( halfFloat ){
      configs.push( {
        type   : halfFloat.HALF_FLOAT_OES, 
        format : gl.RGB
      })
    }
    configs.push( {
      type   : gl.UNSIGNED_BYTE, 
      format : gl.RGB
    })


    var fbo = new Fbo( gl, {
      configs : configs
    });

    fbo.resize( 32, 32 );
    // should always fallback to U8
    // expect( tList ).to.contain( fbo.getActualType() )
    testContext.assertNoError();

  })






  // =============================================
  //         WEBGL 2
  // FLOAT texture need specific internal format
  // AAAND depend on optional support
  // Here, all types should be supported and cascading useless...
  // asset that actualType is the first type in configs
  // =============================================
  

  it( "@WEBGL2 cascading configs FLOAT", function(){


    var color_buffer_float  = gl.getExtension('EXT_color_buffer_float');

    var configs = [{
      type   : gl.FLOAT, 
      format : gl.RGB,
      internal : gl.RGB32F
    }]


    configs.push( {
      type   : gl.UNSIGNED_BYTE, 
      format : gl.RGB
    })


    var fbo = new Fbo( gl, {
      configs : configs
    });

    fbo.resize( 32, 32 );
    
    // expect( fbo.getActualType() ).to.be( gl.FLOAT )
    testContext.assertNoError();

  })


  it( "@WEBGL2 cascading invalid hsould lead to next cfg", function(){


    var configs = [{
      type   : gl.FLOAT, 
      format : gl.RGB,
      internal : gl.RGB
    }]



    configs.push( {
      type   : gl.UNSIGNED_BYTE, 
      format : gl.RGB
    })

    var fbo = new Fbo( gl, {
      configs : configs
    });

    fbo.resize( 32, 32 );
    // should always fallback to U8
    expect( fbo.getActualType() ).to.be( gl.UNSIGNED_BYTE )
    testContext.assertNoError();

  })



  it( "new api ?", function(){
    
    var fbo = new Fbo( gl );


    // attach color from existing texture
    fbo.attachColor( texture, 0 )

    var configs = [{
      type   : gl.FLOAT, 
      format : gl.RGB,
      internal : gl.RGB
    }]

    // attach color from config
    fbo.addColor( 0, configs )


    // attach depth from texture (optional depth texture n webgl 1 )
    fbo.attachDepth( depthTexture )

    // attach depth and or stencil renderbuffer
    fbo.addDepth( true, true )

    // attach depth and or stencil texture
    fbo.addDepthTexture( true, true )


    // general attachment
    fbo.attach( attachmentPoint, target )

    
    /* attachment
    {
      bool    isTexture
      GLEnum  bindingPoint
      [Texture|RenderBuffer] target

      private :

      _resize()

    }
    */ 
    fbo.getColor( )
  })



});