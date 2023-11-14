/**
 * This class is the base for all buffer classes.
 */
abstract class BaseBuffer {
  /**
   * Bind the underlying webgl buffer.
   */
  abstract bind(): void;

  /**
   * Delete all webgl objects related to this BaseBuffer.
   */
  abstract dispose(): void;

  /**
   * Fill the webgl buffer with the given data. You can also pass a number instead to allocate the buffer to a given size.
   *   @param {BufferSource|GLsizeiptr} array The data to use, or a size
   */
  abstract data(array: BufferSource | GLsizeiptr): void;

  /**
   * Set part of the buffer with the given data, starting at an offset.
   *  @param {BufferSource} array The data to use
   *  @param {number} offset The offset (in bytes) where the data should start to be written
   */
  abstract subData(array: BufferSource, offset: number): void;

  /**
   * Shortcut to `gl.drawArrays`
   *   @param {GLenum} mode The type of primitive to draw (`GL_TRIANGLE`, `GL_POINTS` etc)
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  abstract draw(mode: GLenum, count?: number, offset?: number): void;

  /**
   * Shortcut to `gl.drawArrays(gl.POINTS, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawPoints(count?: number, offset?: number) {
    this.draw(0 /* POINTS         */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.LINES, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawLines(count?: number, offset?: number) {
    this.draw(1 /* LINES          */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.LINE_LOOP, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawLineLoop(count?: number, offset?: number) {
    this.draw(2 /* LINE_LOOP      */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.LINE_STRIP, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawLineStrip(count?: number, offset?: number) {
    this.draw(3 /* LINE_STRIP     */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.TRIANGLES, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawTriangles(count?: number, offset?: number) {
    this.draw(4 /* TRIANGLES      */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.TRIANGLE_STRIP, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawTriangleStrip(count?: number, offset?: number) {
    this.draw(5 /* TRIANGLE_STRIP */, count, offset);
  }

  /**
   * Shortcut to `gl.drawArrays(gl.TRIANGLE_FAN, offset, count)`
   *   @param {number} [count] The number of elements to draw (the full buffer is used if omited)
   *   @param {number} [offset=0] The position in the buffer to start from
   */
  drawTriangleFan(count?: number, offset?: number) {
    this.draw(6 /* TRIANGLE_FAN   */, count, offset);
  }
}


export default BaseBuffer