import Program from './program'
import BaseBuffer from './basebuffer'
import { GLContext } from './types';
import { getComponentSize, isBufferSource } from './utils';


/*
 * GL_ARRAY_BUFFER */
const GL_ARRAY_BUFFER = 0x8892;

interface AttributeDef {
  name: string;
  type: GLenum;
  size: number;
  offset: number;
  normalize: boolean;
}

/**
 * @class
 * @implements {Drawable}
 * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
 * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
 * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
 *
 */

class ArrayBuffer extends BaseBuffer {

  readonly gl: GLContext;
  readonly buffer: WebGLBuffer;
  
  usage: GLenum;
  stride    : number;
  byteLength: number;
  length    : number;
  attribs: AttributeDef[];
  

  constructor(gl: GLContext, data?: GLsizeiptr | BufferSource, usage: GLenum = gl.STATIC_DRAW ) {
    super();

    this.gl = gl;
    this.usage = usage || gl.STATIC_DRAW;
    this.buffer = <WebGLBuffer>gl.createBuffer();
    this.attribs = [];
    this.stride = 0;
    this.byteLength = 0;
    this.length = 0;

    if (data) {
      this.data(data);
    }
  }

  /**
   * Bind the underlying webgl buffer.
   */
  bind() {
    this.gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
  }

  /**
   * Add attribute declaration for this buffer. Once attributes declared, the buffer can be linked to
   * programs attributes using {@link ArrayBuffer#attribPointer}
   *  @param {string} name the name of the program's attribute
   *  @param {uint} size the size of the attribute (3 for a vec3)
   *  @param {GLenum} type the type of data (GL_FLOAT, GL_SHORT etc)
   *  @param {boolean} [normalize=false] indicate if the data must be normalized
   */
  attrib(name: string, size: number, type: GLenum, normalize: boolean = false): this {
    this.attribs.push({
      name,
      type: 0 | type,
      size: 0 | size,
      normalize,
      offset: this.stride,
    });
    this.stride += getComponentSize(type) * size;
    this._computeLength();
    return this;
  }

  /**
   * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
   *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
   */

  data(array: BufferSource | GLsizeiptr) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
    gl.bufferData(GL_ARRAY_BUFFER, array as any, this.usage);
    gl.bindBuffer(GL_ARRAY_BUFFER, null);

    this.byteLength = isBufferSource(array) ? array.byteLength : array;
    this._computeLength();
  }

  /**
   * Set a part of the buffer with the given data, starting a offset (in bytes)
   *  @param {typedArray} array the data to send to buffer
   *  @param {uint} offset the offset in byte where the data will be written
   */
  subData(array: BufferSource, offset: number) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(GL_ARRAY_BUFFER, offset, array);
    gl.bindBuffer(GL_ARRAY_BUFFER, null);
  }

  /**
   * Link given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
   * before calling this method.
   *   @param {Program} program the nanogl Program
   */
  attribPointer(program: Program) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);

    for (var i = 0; i < this.attribs.length; i++) {
      var attrib = this.attribs[i];

      if (program[attrib.name] !== undefined) {
        var aLocation = program[attrib.name]();
        gl.enableVertexAttribArray(aLocation);
        gl.vertexAttribPointer(aLocation, attrib.size, attrib.type, attrib.normalize, this.stride, attrib.offset);
      }
    }
  }

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
   *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
   *   @param {uint} [offset=0] the position of the first vertex to draw
   */
  draw(mode: GLenum, count: number = this.length, offset: number = 0) {
    this.gl.drawArrays(mode, offset, 0|count);
  }

  /**
   * Delete underlying webgl objects
   */
  dispose() {
    this.gl.deleteBuffer(this.buffer);
  }

  _computeLength() {
    if (this.stride > 0) {
      this.length = this.byteLength / this.stride;
    }
  }
}


export default ArrayBuffer