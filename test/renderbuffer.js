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
    r.resize( w, h );
    testContext.assertNoError();

  })

  it( "resize and alloc", function(){
    
    var r = new Renderbuffer( gl );
    r.resize( w, h );
    r.allocate();
    testContext.assertNoError();

  })

  it( "bind", function(){
    
    var r = new Renderbuffer( gl );
    r.resize( w, h );
    r.allocate();
    r.bind();
    testContext.assertNoError();

  })

  it( "dispose", function(){
    
    var r = new Renderbuffer( gl );
    r.resize( w, h );
    r.allocate();
    r.bind();
    r.dispose();
    testContext.assertNoError();

  })


});