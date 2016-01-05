var ArrayBuffer = require( '../arraybuffer' );
var Program = require( '../program' );

var expect  = require( 'expect.js' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();

var vertexData = new Uint8Array( 24 * 4 );
var fVertexData = new Float32Array( vertexData.buffer );

fVertexData.set( [ -1, -1, 0, 0, 0 ], 0  );
fVertexData.set( [  1, -1, 0, 1, 0 ], 6  );
fVertexData.set( [ -1,  1, 0, 0, 1 ], 12 );
fVertexData.set( [  1,  1, 0, 1, 1 ], 18 );

vertexData.set( [0xFF, 0,    0,    0xFF ], 20 + 0 );
vertexData.set( [0xFF, 0xFF, 0,    0xFF ], 20 + 24 );
vertexData.set( [0xFF, 0xFF, 0,    0xFF ], 20 + 48 );
vertexData.set( [0,    0,    0xFF, 0xFF ], 20 + 72 );

describe( "ArrayBuffer", function(){

  it( "should be exported", function(){

    expect( ArrayBuffer ).to.be.ok( );

  });

  it( "constructor should return instance", function(){

    var p = new ArrayBuffer( gl );
    expect( p ).to.be.ok( );
    expect( p.gl ).to.be.ok( );

  });


  it( "ctor should leave clean state", function(){
    var p = new ArrayBuffer( gl );
    testContext.assertNoError();
  });


  it( "dispose should leave clean state", function(){
    var p = new ArrayBuffer( gl );
    p.dispose();
    testContext.assertNoError();
  });


  it( "data() should leave clean state", function(){
    var p = new ArrayBuffer( gl );
    p.data( vertexData );
    testContext.assertNoError();
  });


  it( "subData() should leave clean state", function(){
    var p = new ArrayBuffer( gl );
    p.data( vertexData );
    p.subData( new Float32Array([2, 3, 4]), 24)
    testContext.assertNoError();
  });


  it( "should have correct stride and lenght", function(){
    var b = new ArrayBuffer( gl );
    b.data( vertexData );

    b.attrib( 'aPosition', 3, gl.FLOAT );
    b.attrib( 'aTexCoord', 2, gl.FLOAT );
    b.attrib( 'aColor', 4, gl.UNSIGNED_BYTE, true );

    expect( b._stride ).to.be.equal( 24 )
    expect( b.length ).to.be.equal( 4 )

  });



  it( "should set attribPointer", function(){
    var b = new ArrayBuffer( gl );
    b.data( vertexData );

    testContext.assertNoError();

    var p = new Program( gl );
    p.compile(
      require( './glsl/test_uvec3_array.vert'),
      require( './glsl/test_uvec3_array.frag')
    );
    p.use()

    b.attrib( 'aPosition', 3, gl.FLOAT );
    b.attrib( 'aTexCoord', 2, gl.FLOAT );
    b.attrib( 'aColor', 4, gl.UNSIGNED_BYTE, true );

    b.attribPointer( p );
    testContext.assertNoError();

  });




  describe( "should render", function(){

    var p = new Program( gl );
    p.compile(
      require( './glsl/test_arraybuffer.vert'),
      require( './glsl/test_arraybuffer.frag')
    );

    testContext.assertNoError();


    it( "A", function(){


      p.use();
      var b = new ArrayBuffer( gl );
      b.data( vertexData );
      b.attrib( 'aPosition', 3, gl.FLOAT );
      b.attrib( 'aTexCoord', 2, gl.FLOAT );
      b.attrib( 'aColor',    4, gl.UNSIGNED_BYTE, true );
      b.attribPointer( p );
      b.drawTriangleStrip();
      testContext.testPixel( 32, 32, 0xfffbfb81 )
      testContext.testPixel( 0, 0, 0xffff0402 )
      testContext.assertNoError();
    });

    it( "after subdata", function(){
      p.use();
      var b = new ArrayBuffer( gl );
      b.data( vertexData );
      b.subData( new Uint8Array([128, 128, 128, 128]), 24 );
      b.attrib( 'aPosition', 3, gl.FLOAT );
      b.attrib( 'aTexCoord', 2, gl.FLOAT );
      b.attrib( 'aColor',    4, gl.UNSIGNED_BYTE, true );
      b.attribPointer( p );
      b.drawTriangleStrip();
      testContext.testPixel( 32, 32, 0xffbcbcc0 )
      testContext.testPixel( 0, 0, 0xffff0402 )
      testContext.assertNoError();
    });

  });







});