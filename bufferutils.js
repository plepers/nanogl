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

  Drawable: function( proto ){
    proto.drawPoints         = function(count, offset){ this.draw( this.gl.POINTS         , count, offset ); };
    proto.drawLineStrip      = function(count, offset){ this.draw( this.gl.LINE_STRIP     , count, offset ); };
    proto.drawLineLoop       = function(count, offset){ this.draw( this.gl.LINE_LOOP      , count, offset ); };
    proto.drawLines          = function(count, offset){ this.draw( this.gl.LINES          , count, offset ); };
    proto.drawTriangleStrip  = function(count, offset){ this.draw( this.gl.TRIANGLE_STRIP , count, offset ); };
    proto.drawTriangleFan    = function(count, offset){ this.draw( this.gl.TRIANGLE_FAN   , count, offset ); };
    proto.drawTriangles      = function(count, offset){ this.draw( this.gl.TRIANGLES      , count, offset ); };
  }

};


/**
 * Interface for buffer that can be drawn.
 *
 * @interface Drawable
 */

/**
 * Shortcut to gl.drawArrays( gl.POINTS, offset, count )
 * @function
 * @name Drawable#drawPoints
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.LINE_STRIP, offset, count )
 * @function
 * @name Drawable#drawLineStrip
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.LINE_LOOP, offset, count )
 * @function
 * @name Drawable#drawLineLoop
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.LINES, offset, count )
 * @function
 * @name Drawable#drawLines
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.TRIANGLE_STRIP, offset, count )
 * @function
 * @name Drawable#drawTriangleStrip
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.TRIANGLE_FAN, offset, count )
 * @function
 * @name Drawable#drawTriangleFan
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */

/**
 * Shortcut to gl.drawArrays( gl.TRIANGLES, offset, count )
 * @function
 * @name Drawable#drawTriangles
 *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
 *   @param {uint} [offset=0] the position in buffer to start from.
 */
