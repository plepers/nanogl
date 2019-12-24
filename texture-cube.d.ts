import BaseTexture from './texture-base';
import { GLContext } from './types';
export default class TextureCube extends BaseTexture {
    _target: GLenum;
    constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum);
    fromImages(imgs: TexImageSource[]): void;
}
