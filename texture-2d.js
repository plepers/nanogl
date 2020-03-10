import AbstractTexture, { TextureType } from './texture-base';
const GL_TEXTURE_2D = 0x0de1;
export default class Texture2D extends AbstractTexture {
    constructor(gl, format, type, internal) {
        super(gl, format, type, internal);
        this.textureType = TextureType.TEXTURE_2D;
        this._target = GL_TEXTURE_2D;
        gl.bindTexture(GL_TEXTURE_2D, this.id);
        this.setFilter(true);
    }
    fromImage(img) {
        const gl = this.gl;
        this.width = img.width;
        this.height = img.height;
        gl.bindTexture(GL_TEXTURE_2D, this.id);
        gl.texImage2D(GL_TEXTURE_2D, 0, this.internal, this.format, this.type, img);
    }
    fromData(width, height, data = null) {
        const gl = this.gl;
        this.width = width;
        this.height = height;
        data = data || null;
        gl.bindTexture(GL_TEXTURE_2D, this.id);
        gl.texImage2D(GL_TEXTURE_2D, 0, this.internal, width, height, 0, this.format, this.type, data);
    }
}
