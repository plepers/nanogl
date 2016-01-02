var IndexBuffer = require( '../../indexbuffer' );
var Program = require( '../../program' );

var expect  = require( 'expect.js' );

var testContext = require( '../utils/TestContext' );
var gl = testContext.getContext();

var indices = new Uint16Array([
  0, 1, 2,
  0, 2, 3
]);

describe( "ArrayBuffer", function(){

  it( "should be exported", function(){

    expect( IndexBuffer ).to.be.ok( );

  });

  it( "constructor should return instance", function(){

    var p = new IndexBuffer( gl );
    expect( p ).to.be.ok( );
    expect( p.gl ).to.be.ok( );

  });


  it( "ctor should leave clean state", function(){
    var p = new IndexBuffer( gl );
    testContext.assertNoError();
  });


  it( "ctor should set default type", function(){
    var p = new IndexBuffer( gl );
    expect( p.type ).to.be.equal( gl.UNSIGNED_SHORT );
    expect( p.usage ).to.be.equal( gl.STATIC_DRAW );
  });


  it( "dispose should leave clean state", function(){
    var p = new IndexBuffer( gl );
    p.dispose();
    testContext.assertNoError();
  });


  it( "data() should leave clean state", function(){
    var p = new IndexBuffer( gl );
    p.data( indices );
    testContext.assertNoError();
  });


  it( "subData() should leave clean state", function(){
    var p = new IndexBuffer( gl );
    p.data( indices );
    p.subData( new Uint16Array( [2, 3, 4]), 6)
    testContext.assertNoError();
  });







});