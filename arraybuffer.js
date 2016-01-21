var BufferUtils = require( './bufferutils' );

var TGT = 0x8892;

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


  bind: function(){
    this.gl.bindBuffer( TGT, this.buffer );
  },


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


  data: function( array ){
    var gl = this.gl;
    gl.bindBuffer( TGT, this.buffer );
    gl.bufferData( TGT, array, this.usage );
    gl.bindBuffer( TGT, null );

    this.byteLength = ( array.byteLength === undefined ) ? array : array.byteLength;
    this._computeLength();
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


  draw: function( mode, count, offset ){
    count  = ( count === undefined  ) ? this.length : count;
    offset = ( offset === undefined ) ? 0 : offset;
    this.gl.drawArrays( mode, offset, count );
  },


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


BufferUtils.createDrawFunctions( ArrayBuffer.prototype );


module.exports = ArrayBuffer;
