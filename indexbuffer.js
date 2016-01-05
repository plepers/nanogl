var BufferUtils = require( './bufferutils' );

var TGT = 0x8893;


function IndexBuffer( gl, type, data, usage ){
  this.gl     = gl;
  this.buffer = gl.createBuffer();
  this.length = 0;
  this.type   = type || gl.UNSIGNED_SHORT;
  this.usage  = usage || gl.STATIC_DRAW;
  this.typeSize = BufferUtils.getComponentSize( this.type );


  if( data ){
    this.data( data );
  }
}


IndexBuffer.prototype = {


  bind: function(){
    this.gl.bindBuffer( TGT, this.buffer );
  },


  data: function( array ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );
    gl.bufferData( TGT, array, this.usage );
    gl.bindBuffer( TGT, null );
    this.length = array.byteLength / this.typeSize;
  },


  subData: function( array, offset ){
    var gl = this.gl;
    gl.bindBuffer(    TGT, this.buffer );
    gl.bufferSubData( TGT, offset, array );
    gl.bindBuffer(    TGT, null );
  },


  dispose: function(){
    this.gl.deleteBuffer( this.buffer );
    this.buffer = null;
    this.gl = null;
  },


  draw: function( mode, count, offset ){
    count  = ( count === undefined  ) ? this.length : count;
    offset = ( offset === undefined ) ? 0 : offset;
    this.gl.drawElements( mode, count, this.type, offset );
  }


};


BufferUtils.createDrawFunctions( IndexBuffer.prototype );


module.exports = IndexBuffer;