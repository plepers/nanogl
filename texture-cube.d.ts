import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';
export default class TextureCube extends AbstractTexture {
    readonly textureType: TextureType.TEXTURE_CUBE;
    _target: GLenum;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    fromImages(imgs: TexImageSource[]): void;
}
