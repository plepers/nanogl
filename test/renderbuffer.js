import Renderbuffer from '../renderbuffer'
var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();



describe( "Renderbuffer", function(){

  var w = 16, h = 16;

  it( "ctor", function(){
    var r = new Renderbuffer( gl );
    testContext.assertNoError();
  })

  
  it( "resize", function(){
    var r = new Renderbuffer( gl );
    testContext.assertNoError();
  })


  it( "allocate", function(){
    var r = new Renderbuffer( gl );
    r.allocate( w, h, 0 );
    testContext.assertNoError();
  })


  it( "allocate Msaa 4", function(){
    var r = new Renderbuffer( gl );
    r.multisampling( 4 );
    r.allocate( w, h );
    testContext.assertNoError();
  })


  it( "allocate Msaa 4 ctor", function(){
    var r = new Renderbuffer( gl, gl.RGBA8, 4 );
    r.allocate( w, h );
    testContext.assertNoError();
  })


  it( "allocate Msaa 4 realooc", function(){
    var r = new Renderbuffer( gl );
    r.allocate( w, h );
    r.multisampling( 4 );
    testContext.assertNoError();
  })


  it( "bind", function(){
    var r = new Renderbuffer( gl );
    r.allocate( w, h );
    r.bind();
    testContext.assertNoError();
  })


  it( "dispose", function(){
    var r = new Renderbuffer( gl );
    r.allocate( w, h );
    r.bind();
    r.dispose();
    testContext.assertNoError();
  })


});