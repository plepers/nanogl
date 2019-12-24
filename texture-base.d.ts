import { GLContext } from './types';
export default abstract class BaseTexture {
    readonly gl: GLContext;
    readonly id: WebGLTexture;
    width: number;
    height: number;
    format: GLenum;
    internal: GLenum;
    type: GLenum;
    readonly _uid: number;
    abstract _target: GLenum;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    setFormat(format?: GLenum, type?: GLenum, internal?: GLenum): void;
    bind(unit?: number): void;
    dispose(): void;
    setFilter(smooth?: boolean, mipmap?: boolean, miplinear?: boolean): this;
    repeat(): this;
    clamp(): this;
    mirror(): this;
    wrap(wrap: GLenum): this;
}
