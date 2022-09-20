import { getTextureFiltering } from './utils';
let _UID = 0;
export var TextureType;
(function (TextureType) {
    TextureType[TextureType["NONE"] = 0] = "NONE";
    TextureType[TextureType["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
    TextureType[TextureType["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
    TextureType[TextureType["TEXTURE_CUBE"] = 34067] = "TEXTURE_CUBE";
    TextureType[TextureType["TEXTURE_3D"] = 32879] = "TEXTURE_3D";
})(TextureType || (TextureType = {}));
export default class AbstractTexture {
    constructor(gl, format, type, internal) {
        this.textureType = TextureType.NONE;
        this.format = 0;
        this.internal = 0;
        this.type = 0;
        this._uid = _UID++;
        this.gl = gl;
        this.id = gl.createTexture();
        this.width = 0;
        this.height = 0;
        this.setFormat(format, type, internal);
    }
    setFormat(format, type, internal) {
        this.format = format || this.gl.RGB;
        this.internal = internal || this.format;
        this.type = type || this.gl.UNSIGNED_BYTE;
    }
    bind(unit) {
        const gl = this.gl;
        if (unit !== undefined) {
            gl.activeTexture(gl.TEXTURE0 + (0 | unit));
        }
        gl.bindTexture(this._target, this.id);
    }
    dispose() {
        this.gl.deleteTexture(this.id);
    }
    setFilter(smooth = false, mipmap = false, miplinear = false) {
        const gl = this.gl;
        gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
        gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
        return this;
    }
    repeat() {
        this.wrap(this.gl.REPEAT);
        return this;
    }
    clamp() {
        this.wrap(this.gl.CLAMP_TO_EDGE);
        return this;
    }
    mirror() {
        this.wrap(this.gl.MIRRORED_REPEAT);
        return this;
    }
    wrap(wrap) {
        const gl = this.gl;
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrap);
        return this;
    }
}
