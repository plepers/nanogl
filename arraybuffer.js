var BufferUtils = require( './bufferutils' );

/*
 * GL_ARRAY_BUFFER */
var TGT = 0x8892;



/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
function ArrayBuffer( gl, data, usage ){
  this.gl         = gl;
  this.usage      = usage || gl.STATIC_DRAW;
  this.buffer     = gl.createBuffer();
  this.attribs    = [];
  this.stride     = 0;
  this.byteLength = 0;
  this.length     = 0;

  if( data ){
    this.data( data );
  }
}


ArrayBuffer.prototype = {

  /**
   * Bind the underlying webgl buffer.
   */
  bind: function(){
    this.gl.bindBuffer( TGT, this.buffer );
  },

  /**
   * Add attribute declaration for this buffer. Once attributes declared, the buffer can be linked to
   * programs attributes using {@link ArrayBuffer#attribPointer}
   *  @param {string} name the name of the program's attribute
   *  @param {uint} size the size of the attribute (3 for a vec3)
   *  @param {GLenum} type the type of data (GL_FLOAT, GL_SHORT etc)
   *  @param {boolean} [normalize=false] indicate if the data must be normalized
   */
  attrib: function( name, size, type, normalize ){
    this.attribs.push({
      name      : name       ,
      type      : 0|type     ,
      size      : 0|size     ,
      normalize : !!normalize,
      offset    : this.stride
    });
    this.stride += BufferUtils.getComponentSize( type ) * size;
    this._computeLength();
    return this;
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

    this.byteLength = ( array.byteLength === undefined ) ? array : array.byteLength;
    this._computeLength();
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
   * Link given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
   * before calling this method.
   *   @param {Program} program the nanogl Program
   */
  attribPointer: function( program ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );

    for (var i = 0; i < this.attribs.length; i++) {
      var attrib = this.attribs[i];

      if( program[attrib.name] !== undefined ){
        var aLocation = program[attrib.name]();
        gl.enableVertexAttribArray( aLocation );
        gl.vertexAttribPointer( aLocation,
                                attrib.size,
                                attrib.type,
                                attrib.normalize,
                                this.stride,
                                attrib.offset
                              );
      }

    }
  },

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first vertex to draw
   */
  draw: function( mode, count, offset ){
    count  = ( count === undefined  ) ? this.length : count;
    this.gl.drawArrays( mode, offset, 0|count );
  },

  /**
   * Delete underlying webgl objects
   */
  dispose: function(){
    this.gl.deleteBuffer( this.buffer );
    this.buffer = null;
    this.gl = null;
  },


  _computeLength: function(){
    if( this.stride > 0 ) {
      this.length = this.byteLength / this.stride;
    }
  }

};

/*
 * Implement Drawable
 */
BufferUtils.Drawable( ArrayBuffer.prototype );


module.exports = ArrayBuffer;
