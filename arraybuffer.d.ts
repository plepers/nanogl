import Program from './program';
import BaseBuffer from './basebuffer';
import { GLContext } from './types';
interface AttributeDef {
    name: string;
    type: GLenum;
    size: number;
    offset: number;
    normalize: boolean;
    stride: number;
}
declare class ArrayBuffer extends BaseBuffer {
    readonly gl: GLContext;
    readonly buffer: WebGLBuffer;
    usage: GLenum;
    stride: number;
    byteLength: number;
    length: number;
    attribs: AttributeDef[];
    constructor(gl: GLContext, data?: GLsizeiptr | BufferSource, usage?: GLenum, glbuffer?: WebGLBuffer);
    bind(): void;
    attrib(name: string, size: number, type: GLenum, normalize?: boolean): this;
    data(array: BufferSource | GLsizeiptr): void;
    subData(array: BufferSource, offset: number): void;
    attribPointer(program: Program): void;
    draw(mode: GLenum, count?: number, offset?: number): void;
    dispose(): void;
    _computeLength(): void;
}
export default ArrayBuffer;
