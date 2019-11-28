import { GLContext } from './types';
declare class Texture {
    gl: GLContext;
    id: WebGLTexture;
    width: number;
    height: number;
    format: GLenum;
    internal: GLenum;
    type: GLenum;
    _uid: number;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    setFormat(format?: GLenum, type?: GLenum, internal?: GLenum): void;
    fromImage(img: TexImageSource): void;
    fromData(width: number, height: number, data?: ArrayBufferView | null): void;
    bind(unit?: number): void;
    dispose(): void;
    setFilter(smooth?: boolean, mipmap?: boolean, miplinear?: boolean): void;
    repeat(): void;
    clamp(): void;
    mirror(): void;
    wrap(wrap: GLenum): void;
}
export = Texture;
