import { GLContext } from './types';
import BaseBuffer from './basebuffer'
import { getComponentSize, isBufferSource } from './utils';


/* GL_ELEMENT_ARRAY_BUFFER */
const TGT = 0x8893;

/**
 * This class manages ELEMENT_ARRAY_BUFFER type buffers.
 * @extends {BaseBuffer}
 */
class IndexBuffer extends BaseBuffer {
  /** The webgl context this IndexBuffer belongs to */
  readonly gl: GLContext;
  /** The webgl buffer this IndexBuffer writes to */
  readonly buffer: WebGLBuffer;

  /** The usage hint for this buffer */
  usage: GLenum;
  /** The number type of the index data for this buffer */
  type : GLenum;
  /** The number of bytes for each index in this buffer */
  typeSize  : number;
  /** The length in bytes of the buffer */
  byteLength: number;

  /**
    * @param {GLContext} gl  The webgl context this IndexBuffer belongs to
    * @param {GLenum} [type=GL_UNSIGNED_SHORT]  The number type of the index data (`GL_UNSIGNED_BYTE`, `GL_UNSIGNED_INT`, etc.)
    * @param {BufferSource|GLsizeiptr} [data]  The data to fill the buffer with, or the size (in bytes)
    * @param {GLenum} [usage=GL_STATIC_DRAW] The usage hint for this buffer (`GL_STATIC_DRAW`, `GL_DYNAMIC_DRAW`, etc.)
    * @param {WebGLBuffer} [glbuffer] A WebGLBuffer to use instead of creating a new one
    */
  constructor(gl: GLContext, type: GLenum = gl.UNSIGNED_SHORT, data?: GLsizeiptr | BufferSource, usage: GLenum = gl.STATIC_DRAW, glbuffer? : WebGLBuffer ) {
    super();

    this.gl = gl;
    this.usage = usage;
    this.buffer = (glbuffer !== undefined ) ? glbuffer : <WebGLBuffer>gl.createBuffer();

    this.type = 0;
    this.typeSize = 0;
    this.byteLength = 0;

    this.setType(type);

    if (data) {
      this.data(data);
    }
  }

  bind() {
    this.gl.bindBuffer(TGT, this.buffer);
  }

  /**
   *  Change the internal type of the index data of the IndexBuffer.
   *  @param {GLenum} type  the number type of the index data (`GL_UNSIGNED_BYTE`, `GL_UNSIGNED_INT`, etc)
   */
  setType(type: GLenum) {
    this.type = type;
    this.typeSize = getComponentSize(type);
  }

  data(array: GLsizeiptr | BufferSource) {
    const gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferData(TGT, array as any, this.usage);
    gl.bindBuffer(TGT, null);
    this.byteLength = isBufferSource(array) ? array.byteLength : array;
  }

  subData(array: BufferSource, offset: number) {
    const gl = this.gl;
    gl.bindBuffer(TGT, this.buffer);
    gl.bufferSubData(TGT, offset, array);
    gl.bindBuffer(TGT, null);
  }

  dispose() {
    this.gl.deleteBuffer(this.buffer);
  }

  /**
   * Shortcut to `gl.drawArrays`.
   *   @param {GLenum} mode The type of primitive to draw (`GL_TRIANGLE`, `GL_POINTS` etc)
   *   @param {uint} [count=this.length] The number of indices to draw (the full buffer is used if omited)
   *   @param {uint} [offset=0] The position of the first index to draw
   */
  draw(mode: GLenum, count?: number, offset: number = 0) {
    count = (count === undefined) ? this.byteLength / this.typeSize : count;
    this.gl.drawElements(mode, count, this.type, 0 | offset);
  }
}


export default IndexBuffer