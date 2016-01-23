var BufferUtils = require( './bufferutils' );

/* GL_ELEMENT_ARRAY_BUFFER */
var TGT = 0x8893;

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {GLenum} [type=GL_UNSIGNED_SHORT]  the inetger type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
function IndexBuffer( gl, type, data, usage ){
  this.gl       = gl;
  this.buffer   = gl.createBuffer();
  this.type     = type || gl.UNSIGNED_SHORT;
  this.usage    = usage || gl.STATIC_DRAW;
  this.typeSize = BufferUtils.getComponentSize( this.type );
  this.length   = 0;

  if( data ){
    this.data( data );
  }
}


IndexBuffer.prototype = {


  /**
   * Bind the underlying webgl buffer.
   */
  bind: function(){
    this.gl.bindBuffer( TGT, this.buffer );
  },

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */
  data: function( array ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );
    gl.bufferData( TGT, array, this.usage );
    gl.bindBuffer( TGT, null );
    var bl = ( array.byteLength === undefined ) ? array : array.byteLength;
    this.length = bl / this.typeSize;
  },

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData: function( array, offset ){
    var gl = this.gl;
    gl.bindBuffer(    TGT, this.buffer );
    gl.bufferSubData( TGT, offset, array );
    gl.bindBuffer(    TGT, null );
  },


  /**
   * Delete underlying webgl objects
   */
  dispose: function(){
    this.gl.deleteBuffer( this.buffer );
    this.buffer = null;
    this.gl = null;
  },

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of indices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first index to draw
   */
  draw: function( mode, count, offset ){
    count  = ( count === undefined  ) ? this.length : count;
    offset = ( offset === undefined ) ? 0 : offset;
    this.gl.drawElements( mode, count, this.type, offset );
  }


};


/*
 * Implement Drawable
 */
BufferUtils.Drawable( IndexBuffer.prototype );


module.exports = IndexBuffer;