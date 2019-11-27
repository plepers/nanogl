
abstract class BaseBuffer {

  abstract bind(): void;

  abstract dispose(): void;

  abstract data(array: BufferSource | GLsizeiptr): void;

  abstract subData(array: BufferSource, offset: number): void;

  abstract draw(mode: GLenum, count?: number, offset?: number): void;

  /**
   * Shortcut to gl.drawArrays( gl.POINTS, offset, count )
   * @function
   * @name Drawable#drawPoints
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawPoints(count?: number, offset?: number) {
    this.draw(0 /* POINTS         */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.LINES, offset, count )
   * @function
   * @name Drawable#drawLines
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */

  drawLines(count?: number, offset?: number) {
    this.draw(1 /* LINES          */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.LINE_LOOP, offset, count )
   * @function
   * @name Drawable#drawLineLoop
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawLineLoop(count?: number, offset?: number) {
    this.draw(2 /* LINE_LOOP      */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.LINE_STRIP, offset, count )
   * @function
   * @name Drawable#drawLineStrip
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawLineStrip(count?: number, offset?: number) {
    this.draw(3 /* LINE_STRIP     */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.TRIANGLES, offset, count )
   * @function
   * @name Drawable#drawTriangles
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawTriangles(count?: number, offset?: number) {
    this.draw(4 /* TRIANGLES      */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.TRIANGLE_STRIP, offset, count )
   * @function
   * @name Drawable#drawTriangleStrip
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawTriangleStrip(count?: number, offset?: number) {
    this.draw(5 /* TRIANGLE_STRIP */, count, offset);
  }

  /**
   * Shortcut to gl.drawArrays( gl.TRIANGLE_FAN, offset, count )
   * @function
   * @name Drawable#drawTriangleFan
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position in buffer to start from.
   */
  drawTriangleFan(count?: number, offset?: number) {
    this.draw(6 /* TRIANGLE_FAN   */, count, offset);
  }
}


export = BaseBuffer