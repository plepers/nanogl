import { GLContext } from './types';
import BaseBuffer from './basebuffer';
declare class IndexBuffer extends BaseBuffer {
    gl: GLContext;
    usage: GLenum;
    type: GLenum;
    buffer: WebGLBuffer;
    typeSize: number;
    byteLength: number;
    constructor(gl: GLContext, type: GLenum, data: GLsizeiptr | BufferSource, usage: GLenum);
    bind(): void;
    setType(type: GLenum): void;
    data(array: GLsizeiptr | BufferSource): void;
    subData(array: BufferSource, offset: number): void;
    dispose(): void;
    draw(mode: GLenum, count?: number, offset?: number): void;
}
export default IndexBuffer;
