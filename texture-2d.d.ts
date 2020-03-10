import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';
export default class Texture2D extends AbstractTexture {
    readonly textureType: TextureType.TEXTURE_2D;
    _target: GLenum;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    fromImage(img: TexImageSource): void;
    fromData(width: number, height: number, data?: ArrayBufferView | null): void;
}
