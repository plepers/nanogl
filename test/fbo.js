import  Fbo          from '../fbo'
import  Texture2D    from '../texture'
import  Program      from '../program'
import  Renderbuffer from '../renderbuffer'
var expect       = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();



describe( "Fbo", function(){



  it( "ctor should leave clean state", function(){
    
    var fbo = new Fbo( gl );
    testContext.assertNoError();
    
  })


  it( "dispose should leave clean state", function(){
    
    var fbo = new Fbo( gl );
    fbo.dispose()

    testContext.assertNoError();

  })

  it( "should dispose correctly", function(){
    
    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });


  it( "should dispose when not init", function(){
    
    var fbo = new Fbo( gl );
    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });


  it( "should dispose when color attach", function(){
    
    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    fbo.bind()
    fbo.attachColor()
    
    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });

  it( "should dispose when color attach not alloc", function(){
    
    var fbo = new Fbo( gl );
    fbo.bind()
    fbo.attachColor()

    var dispose = function(){
      fbo.dispose()
    }
    expect(dispose).to.not.throwException();
    testContext.assertNoError();
  });



  it( "resize empty fbo", function(){
    
    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    
    testContext.assertNoError();

  })



  it( "should pass render test A", function(){
    var vert, frag, p;

    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    fbo.bind()
    fbo.attachColor();

    // draw 0xFF7F0000 to Fbo color
    vert = require( './glsl/test_uvec3.vert')
    frag = require( './glsl/test_uvec3.frag')
    p = new Program( gl );
    p.compile( vert, frag );
    p.bind()
    p.uVec3( .5, 0, 0 );


    fbo.bind();
    fbo.defaultViewport();
    testContext.drawProgram( p );

    // draw Fbo to screen
    testContext.bindScreen();

    vert = require( './glsl/filltex.vert')
    frag = require( './glsl/filltex.frag')
    p = new Program( gl );
    p.compile( vert, frag );
    p.bind()
    fbo.getColor().bind( 0 );

    testContext.drawProgram( p );

    // test color
    testContext.testPixel( 0, 0, 0xFF800000 )
    testContext.assertNoError();
    fbo.dispose();
  });



  describe( "attach basic color", function(){

    var fbo, tex, color;

    beforeEach( function() {

      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " after resize leave clean state", function(){
    
      fbo.bind()
      fbo.resize( 32, 32 );
      fbo.attach( 0x8CE0, tex );
      testContext.assertNoError();

    })


    it( "after resize make complete fbo ", function(){
      
      fbo.bind()
      fbo.resize( 64, 64 );
      fbo.attach( 0x8CE0, tex );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })

    it( " before resize leave clean state", function(){
    
      fbo.bind()
      fbo.attach( 0x8CE0, tex );
      fbo.resize( 16, 16 );
      testContext.assertNoError();

    })


    it( "before resize make complete fbo ", function(){
      
      fbo.bind()
      fbo.attach( 0x8CE0, tex );
      fbo.resize( 4, 8 );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })

  })



  describe( "detach basic color", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " leave clean state", function(){
    
      fbo.bind()
      fbo.attach( 0x8CE0, tex );
      fbo.resize( 32, 32 );
      fbo.detach( 0x8CE0 );
      testContext.assertNoError();

    })



  })




  describe( "getAttachment", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
      fbo.bind();
      color = fbo.attach( gl.COLOR_ATTACHMENT0, tex );
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })

    it( "return color0", function(){
      
      var att = fbo.getAttachment( gl.COLOR_ATTACHMENT0 );
      expect( att.isTexture() ).to.be.ok()

    })

    it( "return null for color 1", function(){
      
      var att = fbo.getAttachment( gl.COLOR_ATTACHMENT0 + 1);
      expect( att ).to.be(null)

    })
    
  });



  describe( "attach depth/stencil", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
      fbo.bind();
      color = fbo.attach( gl.COLOR_ATTACHMENT0, tex );
    });


    afterEach( function(){
      gl.bindFramebuffer( gl.FRAMEBUFFER, null );
      fbo.dispose()
    })


    it( "after resize leave clean state", function(){
      
      var depth = new Renderbuffer( gl, gl.DEPTH_COMPONENT16 );
      fbo.bind()
      fbo.resize( 32, 32 );
      fbo.attach( gl.DEPTH_ATTACHMENT, depth );
      testContext.assertNoError();

    })


    it( "after resize make complete fbo ", function(){
      
      var depth = new Renderbuffer( gl, gl.DEPTH_COMPONENT16 );

      fbo.bind()
      fbo.resize( 64, 64 );
      fbo.attach( gl.DEPTH_ATTACHMENT, depth );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })


    it( " before resize leave clean state", function(){
      var depth = new Renderbuffer( gl, gl.DEPTH_COMPONENT16 );

      fbo.bind()
      fbo.attach( gl.DEPTH_ATTACHMENT, depth );
      fbo.resize( 16, 16 );
      testContext.assertNoError();

    })


    it( "before resize make complete fbo ", function(){
      var depth = new Renderbuffer( gl, gl.DEPTH_COMPONENT16 );

      fbo.bind()
      fbo.attach( gl.DEPTH_ATTACHMENT, depth );
      fbo.resize( 4, 8 );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })

  })




  describe( "attach depth/stencil helper", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
      fbo.bind();
      color = fbo.attach( gl.COLOR_ATTACHMENT0, tex );
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " depth only", function(){
      
      fbo.attachDepth();
      var att = fbo.getDepth()

      expect( att.format ).to.be( gl.DEPTH_COMPONENT16 )
      testContext.assertNoError();

    })


    it( " stencil only", function(){
      
      fbo.attachDepth( false, true );
      var att = fbo.getDepth( )

      expect( att.format ).to.be( gl.STENCIL_INDEX8 )
      testContext.assertNoError();

    })


    it( " both", function(){
      
      fbo.attachDepth( true, true );
      var att = fbo.getDepth( )

      expect( att.format ).to.be( gl.DEPTH_STENCIL )
      testContext.assertNoError();

    })

    


  })


  describe( " clear", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
      fbo.bind();
      color = fbo.attach( gl.COLOR_ATTACHMENT0, tex );
      fbo.resize( 16,16 )
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " with depth only", function(){
      
      fbo.attachDepth();
      fbo.clear();
      testContext.assertNoError();

    })


    it( " with stencil only", function(){
      
      fbo.attachDepth( false, true );
      fbo.clear();
      testContext.assertNoError();

    })


    it( " with both", function(){
      
      fbo.attachDepth( true, true );
      fbo.clear();
      testContext.assertNoError();

    })

    it( " with none", function(){
      
      fbo.clear();
      testContext.assertNoError();

    })

    


  })


  describe( "@WEBGL2 attach depth/stencil texture helper", function(){

    var fbo, tex, color;

    beforeEach( function() {
      tex = new Texture2D(gl)
      fbo = new Fbo( gl );
      fbo.bind();
      color = fbo.attach( gl.COLOR_ATTACHMENT0, tex );
    });


    afterEach( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " depth only", function(){
      
      fbo.attachDepth( true, false, true );
      var dt = fbo.getDepth()
      expect( dt ).to.be.ok()

      testContext.assertNoError();

    })



    it( " both", function(){
      
      fbo.attachDepth( true, true );
      var att = fbo.getDepth( )

      expect( att ).to.be.ok()
      testContext.assertNoError();

    })




  })




  describe( "@WEBGL2 attach second color", function(){





    it( " test", function(){
      
      var fbo;

      var tex0 = new Texture2D(gl)
      var tex1 = new Texture2D(gl)
      fbo = new Fbo( gl );


      fbo.bind()
      fbo.resize( 32, 32 );
      fbo.attach( 0x8CE0      , tex0 );
      fbo.attach( 0x8CE0 + 1  , tex1 );

      testContext.assertNoError();


      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()

      testContext.assertNoError();

    })


  })




});