import { GLContext } from './types';
import BaseBuffer from './basebuffer';
declare class IndexBuffer extends BaseBuffer {
    readonly gl: GLContext;
    readonly buffer: WebGLBuffer;
    usage: GLenum;
    type: GLenum;
    typeSize: number;
    byteLength: number;
    constructor(gl: GLContext, type?: GLenum, data?: GLsizeiptr | BufferSource, usage?: GLenum, glbuffer?: WebGLBuffer);
    bind(): void;
    setType(type: GLenum): void;
    data(array: GLsizeiptr | BufferSource): void;
    subData(array: BufferSource, offset: number): void;
    dispose(): void;
    draw(mode: GLenum, count?: number, offset?: number): void;
}
export default IndexBuffer;
