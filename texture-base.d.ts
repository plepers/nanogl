import { GLContext } from './types';
import TextureCube from './texture-cube';
import Texture2D from './texture-2d';
export declare enum TextureType {
    NONE = 0,
    TEXTURE_2D = 3553,
    TEXTURE_2D_ARRAY = 35866,
    TEXTURE_CUBE = 34067,
    TEXTURE_3D = 32879
}
export type Texture = TextureCube | Texture2D;
export default abstract class AbstractTexture {
    readonly textureType: TextureType;
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
