var BufferUtils = require( './bufferutils' );

var TGT = 0x8892;

function ArrayBuffer( gl, data, usage ){
  this.gl = gl;
  this.usage = usage || gl.STATIC_DRAW;
  this.buffer = gl.createBuffer();

  this._attribs     = [];
  this._stride      = 0;
  this.byteLength   = 0;
  this.length       = 0;

  if( data ){
    this.data( data, -1 );
  }
}


ArrayBuffer.prototype = {


  bind: function(){
    this.gl.bindBuffer( TGT, this.buffer );
  },


  attrib: function( name, size, type, normalize ){
    this._attribs.push({
      name      : name       ,
      type      : 0|type     ,
      size      : 0|size     ,
      normalize : !!normalize,
      offset    : this._stride
    });
    this._stride += BufferUtils.getComponentSize( type ) * size;
    this.length = this.byteLength / this._stride;
    return this;
  },


  data: function( array ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );
    gl.bufferData( TGT, array, this.usage );
    gl.bindBuffer( TGT, null );

    this.byteLength = array.byteLength;
    if( this._stride > 0 ) {
      this.length = this.byteLength / this._stride;
    }
  },


  subData: function( array, offset ){
    var gl = this.gl;
    gl.bindBuffer(    TGT, this.buffer );
    gl.bufferSubData( TGT, offset, array );
    gl.bindBuffer(    TGT, null );
  },


  attribPointer: function( program ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );

    for (var i = 0; i < this._attribs.length; i++) {
      var attrib = this._attribs[i];

      if( program[attrib.name] !== undefined ){
        gl.vertexAttribPointer( program[attrib.name](),
                                attrib.size,
                                attrib.type,
                                attrib.normalize,
                                this._stride,
                                attrib.offset
                              );
      }

    }
  },


  draw: function( mode, count, offset ){
    count  = ( count === undefined  ) ? this.length : count;
    offset = ( offset === undefined ) ? 0 : offset;
    this.gl.drawArrays( mode, offset, count );
  },


  dispose: function(){
    this.gl.deleteBuffer( this.buffer );
    this.buffer = null;
    this.gl = null;
  }

};


BufferUtils.createDrawFunctions( ArrayBuffer.prototype );


module.exports = ArrayBuffer;
