import AbstractTexture, { TextureType } from './texture-base';
const GL_TEXTURE_CUBE = 0x8513;
export default class TextureCube extends AbstractTexture {
    constructor(gl, format, type, internal) {
        super(gl, format, type, internal);
        this.textureType = TextureType.TEXTURE_CUBE;
        this._target = GL_TEXTURE_CUBE;
        gl.bindTexture(GL_TEXTURE_CUBE, this.id);
        this.setFilter(true);
    }
    fromImages(imgs) {
        var gl = this.gl, fmt = this.format, internal = this.internal, type = this.type;
        this.width = imgs[0].width;
        this.height = imgs[0].height;
        gl.bindTexture(GL_TEXTURE_CUBE, this.id);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, internal, fmt, type, imgs[0]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, internal, fmt, type, imgs[1]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, internal, fmt, type, imgs[2]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, internal, fmt, type, imgs[3]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, internal, fmt, type, imgs[4]);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, internal, fmt, type, imgs[5]);
    }
}
