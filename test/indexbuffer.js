var IndexBuffer = require( '../indexbuffer' );
var ArrayBuffer = require( '../arraybuffer' );
var Program = require( '../program' );

var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
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
    expect( p.typeSize ).to.be.equal( 2 );
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



  it( "should render", function(){
    var b = new IndexBuffer( gl );
    b.data( indices );

    var p = new Program( gl );
    p.compile(
      require( './glsl/test_uvec3.vert'),
      require( './glsl/test_uvec3.frag')
    );
    p.use();
    p.uVec3( 1.0, 1.0, 1.0 );

    var vbuffer = new ArrayBuffer( gl, new Float32Array([
     -1, -1,
      1, -1,
     -1,  1,
      1,  1
    ]) );
    vbuffer.attrib( 'aPosition', 2, gl.FLOAT );
    vbuffer.attribPointer( p );

    gl.clear( gl.COLOR_BUFFER_BIT )
    b.bind()
    b.drawTriangles();


    testContext.testPixel( 32, 10, 0xffffffff );
    testContext.testPixel( 32, 54, 0xffffffff );
    testContext.testPixel( 10, 32, 0xffffffff );
    testContext.testPixel( 54, 32, 0xff000000 );

    b.subData( new Uint16Array([
      2, 1, 3]), 6 );
    b.bind()
    b.drawTriangles();

    testContext.testPixel( 32, 10, 0xffffffff );
    testContext.testPixel( 32, 54, 0xffffffff );
    testContext.testPixel( 10, 32, 0xffffffff );
    testContext.testPixel( 54, 32, 0xffffffff );
    testContext.assertNoError();



  });









});