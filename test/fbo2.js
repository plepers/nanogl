var Fbo     = require( '../fbo2' )
var Texture = require( '../texture' )
var expect  = require( 'expect.js' );

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


  it( "resize empty fbo", function(){
    
    var fbo = new Fbo( gl );
    fbo.resize( 32, 32 );
    
    testContext.assertNoError();

  })



  describe( "attach basic color", function(){

    var fbo, tex, color;

    before(function() {
      tex = new Texture(gl)
      color = new Fbo.Attachment( tex )
      fbo = new Fbo( gl );
    });


    after( function(){
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      fbo.dispose()
    })


    it( " after resize leave clean state", function(){
    
      fbo.bind()
      fbo.resize( 32, 32 );
      fbo.attach( color, 0x8CE0 );
      testContext.assertNoError();

    })


    it( "after resize make complete fbo ", function(){
      
      fbo.bind()
      fbo.resize( 32, 32 );
      fbo.attach( color, 0x8CE0 );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })

    it( " before resize leave clean state", function(){
    
      fbo.bind()
      fbo.attach( color, 0x8CE0 );
      fbo.resize( 32, 32 );
      testContext.assertNoError();

    })


    it( "before resize make complete fbo ", function(){
      
      fbo.bind()
      fbo.attach( color, 0x8CE0 );
      fbo.resize( 32, 32 );

      expect( fbo.isValid() ).to.be.ok()
      testContext.assertNoError();

    })

  })




});