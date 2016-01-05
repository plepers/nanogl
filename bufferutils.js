module.exports = {

  getComponentSize : function( type ){
    switch( type ){
      case 0x1400 : //gl.BYTE:
      case 0x1401 : //gl.UNSIGNED_BYTE:
        return 1;
      case 0x1402 : //gl.SHORT:
      case 0x1403 : //gl.UNSIGNED_SHORT:
        return 2;
      case 0x1404 : //gl.INT:
      case 0x1405 : //gl.UNSIGNED_INT:
      case 0x1406 : //gl.FLOAT:
        return 4;
      default :
        return 0;
    }
  },


  createDrawFunctions: function( proto ){
    proto.drawPoints         = function(count, offset){ this.draw( this.gl.POINTS         , count, offset ); };
    proto.drawLineStrip      = function(count, offset){ this.draw( this.gl.LINE_STRIP     , count, offset ); };
    proto.drawLineLoop       = function(count, offset){ this.draw( this.gl.LINE_LOOP      , count, offset ); };
    proto.drawLines          = function(count, offset){ this.draw( this.gl.LINES          , count, offset ); };
    proto.drawTriangleStrip  = function(count, offset){ this.draw( this.gl.TRIANGLE_STRIP , count, offset ); };
    proto.drawTriangleFan    = function(count, offset){ this.draw( this.gl.TRIANGLE_FAN   , count, offset ); };
    proto.drawTriangles      = function(count, offset){ this.draw( this.gl.TRIANGLES      , count, offset ); };
  }

};
