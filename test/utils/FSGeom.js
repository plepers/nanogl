function FSGeom( gl ){

  this.gl = gl;

  this.vertices = new Float32Array( [
    -1, -1,
    1,  -1,
    1,   1,
    -1,  1
  ] );

  this.indices = new Uint16Array( [
    0, 1, 2,
    0, 2, 3
  ] );

  this.stride = 8;

  this.allocate();

}

FSGeom.prototype = {

  allocate : function(){
    var gl = this.gl;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    this.ibuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer );
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null );
  },


  bind : function( prg ){
    var gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer );
    gl.vertexAttribPointer( prg.aPosition, 2, gl.FLOAT, false, this.stride, 0 );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffer );

  },

  render : function() {
    var gl = this.gl;
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0 );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null );
  }

}

module.exports = FSGeom;