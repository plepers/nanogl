import Program = require('./program');
import BaseBuffer = require('./basebuffer');
import { GLContext } from './types';
interface AttributeDef {
    name: string;
    type: GLenum;
    size: number;
    offset: number;
    normalize: boolean;
}
declare class ArrayBuffer extends BaseBuffer {
    gl: GLContext;
    usage: GLenum;
    buffer: WebGLBuffer;
    attribs: AttributeDef[];
    stride: number;
    byteLength: number;
    length: number;
    constructor(gl: GLContext, data?: GLsizeiptr | BufferSource, usage?: GLenum);
    bind(): void;
    attrib(name: string, size: number, type: GLenum, normalize?: boolean): this;
    data(array: BufferSource | GLsizeiptr): void;
    subData(array: BufferSource, offset: number): void;
    attribPointer(program: Program): void;
    draw(mode: GLenum, count?: number, offset?: number): void;
    dispose(): void;
    _computeLength(): void;
}
export = ArrayBuffer;
