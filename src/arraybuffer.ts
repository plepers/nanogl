import Program from './program'
import BaseBuffer from './basebuffer'
import { GLContext } from './types';
import { getComponentSize, isBufferSource } from './utils';


/*
 * GL_ARRAY_BUFFER */
const GL_ARRAY_BUFFER = 0x8892;

export interface AttributeDef {
  name: string;
  type: GLenum;
  size: number;
  offset: number;
  normalize: boolean;
  stride: number;
}

/**
 * This class manages ARRAY_BUFFER type buffers.
 * @extends {BaseBuffer}
 */
class ArrayBuffer extends BaseBuffer {
  /** The webgl context this ArrayBuffer belongs to */
  readonly gl: GLContext;
  /** The webgl buffer this ArrayBuffer writes to */
  readonly buffer: WebGLBuffer;

  /** The usage hint for this buffer */
  usage: GLenum;
  /** The number of bytes for each vertex in this buffer  */
  stride    : number;
  /** The length in bytes of the buffer */
  byteLength: number;
  /** The number of vertices in the buffer data */
  length    : number;
  /** The attributes declared for this buffer */
  attribs: AttributeDef[];

  /**
    * @param {GLContext} gl  The webgl context this ArrayBuffer belongs to
    * @param {BufferSource|GLsizeiptr} [data]  The data to fill the buffer with, or the size (in bytes)
    * @param {GLenum} [usage=GL_STATIC_DRAW] The usage hint for this buffer (`STATIC_DRAW`, `DYNAMIC_DRAW`, etc.)
    * @param {WebGLBuffer} [glbuffer] A WebGLBuffer to use instead of creating a new one
    */
  constructor(gl: GLContext, data?: GLsizeiptr | BufferSource, usage: GLenum = gl.STATIC_DRAW, glbuffer? : WebGLBuffer ) {
    super();

    this.gl = gl;
    this.usage = usage;

    this.buffer = (glbuffer !== undefined ) ? glbuffer : <WebGLBuffer>gl.createBuffer();

    this.attribs = [];
    this.stride = 0;
    this.byteLength = 0;
    this.length = 0;

    if (data) {
      this.data(data);
    }
  }

  bind() {
    this.gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
  }

  /**
   * Add attribute declaration for this buffer. Once the attributes declared, the buffer can be linked to
   * the programs attributes using {@link ArrayBuffer#attribPointer}
   *  @param {string} name The name of the program's attribute
   *  @param {number} size The size of the attribute (`1` for a number, `2` for a vec2, etc.)
   *  @param {GLenum} type The type of data (`GL_FLOAT`, `GL_SHORT`, etc.)
   *  @param {boolean} [normalize=false] Indicate if the data must be normalized
   */
  attrib(name: string, size: number, type: GLenum, normalize: boolean = false): this {
    this.attribs.push({
      name,
      type: 0 | type,
      size: 0 | size,
      normalize,
      offset: this.stride,
      stride:0
    });
    this.stride += getComponentSize(type) * size;
    this._computeLength();
    return this;
  }

  data(array: BufferSource | GLsizeiptr) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
    gl.bufferData(GL_ARRAY_BUFFER, array as any, this.usage);
    gl.bindBuffer(GL_ARRAY_BUFFER, null);

    this.byteLength = isBufferSource(array) ? array.byteLength : array;
    this._computeLength();
  }

  subData(array: BufferSource, offset: number) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(GL_ARRAY_BUFFER, offset, array);
    gl.bindBuffer(GL_ARRAY_BUFFER, null);
  }

  /**
   * Link the given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
   * before calling this method.
   *   @param {Program} program The program to link
   */
  attribPointer(program: Program) {
    const gl = this.gl;
    gl.bindBuffer(GL_ARRAY_BUFFER, this.buffer);

    for (var i = 0; i < this.attribs.length; i++) {
      var attrib = this.attribs[i];

      if (program[attrib.name] !== undefined) {
        var aLocation = program[attrib.name]();
        gl.enableVertexAttribArray(aLocation);
        gl.vertexAttribPointer(aLocation, attrib.size, attrib.type, attrib.normalize, attrib.stride || this.stride, attrib.offset);
      }
    }
  }

  /**
   * Shortcut to gl.drawArrays
   *   @param {GLenum} mode The type of primitive to draw (`GL_TRIANGLE`, `GL_POINTS` etc)
   *   @param {uint} [count=this.length] The number of vertices to draw (the full buffer is used if omited)
   *   @param {uint} [offset=0] The position of the first vertex to draw
   */
  draw(mode: GLenum, count: number = this.length, offset: number = 0) {
    this.gl.drawArrays(mode, offset, 0|count);
  }

  dispose() {
    this.gl.deleteBuffer(this.buffer);
  }

  /**
   * Compute the number of vertices in the buffer data
   */
  _computeLength() {
    if (this.stride > 0) {
      this.length = this.byteLength / this.stride;
    }
  }
}


export default ArrayBuffer