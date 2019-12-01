import { GLContext } from './types';
import BaseBuffer from './basebuffer'
import { getComponentSize, isBufferSource } from './utils';


/* GL_ELEMENT_ARRAY_BUFFER */
const TGT = 0x8893;

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {GLenum} [type=GL_UNSIGNED_SHORT]  the inetger type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */
class IndexBuffer extends BaseBuffer {
  gl: GLContext;
  usage: GLenum;
  type: GLenum;
  buffer: WebGLBuffer;
  typeSize: number;
  byteLength: number;

  constructor(gl: GLContext, type: GLenum, data: GLsizeiptr | BufferSource, usage: GLenum) {
    super();

    this.gl = gl;
    this.buffer = <WebGLBuffer>gl.createBuffer();
    this.usage = usage || gl.STATIC_DRAW;

    this.type = 0;
    this.typeSize = 0;
    this.byteLength = 0;

    this.setType(type || gl.UNSIGNED_SHORT);

    if (data) {
      this.data(data);
    }
  }

  /**
   * Bind the underlying webgl buffer.
   */
  bind() {
    this.gl.bindBuffer(TGT, this.buffer);
  }

  /**
   *  Change the type of internal type of the IndexBuffer
   *  @param {GLenum} type  the integer type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
   */
  setType(type: GLenum) {
    this.type = type;
    this.typeSize = getComponentSize(type);
  }

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */
  data(array: GLsizeiptr | BufferSource) {
    const gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferData(TGT, array as any, this.usage);
    gl.bindBuffer(TGT, null);
    this.byteLength = isBufferSource(array) ? array.byteLength : array;
  }

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData(array: BufferSource, offset: number) {
    const gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferSubData(TGT, offset, array);
    gl.bindBuffer(TGT, null);
  }

  /**
   * Delete underlying webgl objects
   */
  dispose() {
    this.gl.deleteBuffer(this.buffer);
  }

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of indices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first index to draw
   */
  draw(mode: GLenum, count?: number, offset: number = 0) {
    count = (count === undefined) ? this.byteLength / this.typeSize : count;
    this.gl.drawElements(mode, count, this.type, 0 | offset);
  }
}


export default IndexBuffer