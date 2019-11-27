"use strict";
const utils_1 = require("./utils");
let _UID = 0;
const T2D = 0x0de1;
class Texture {
    constructor(gl, format, type, internal) {
        this.format = 0;
        this.internal = 0;
        this.type = 0;
        this._uid = _UID++;
        this.gl = gl;
        this.id = gl.createTexture();
        this.width = 0;
        this.height = 0;
        this.setFormat(format, type, internal);
        gl.bindTexture(T2D, this.id);
        this.setFilter(true);
    }
    setFormat(format, type, internal) {
        this.format = format || this.gl.RGB;
        this.internal = internal || this.format;
        this.type = type || this.gl.UNSIGNED_BYTE;
    }
    fromImage(img) {
        const gl = this.gl;
        this.width = img.width;
        this.height = img.height;
        gl.bindTexture(T2D, this.id);
        gl.texImage2D(T2D, 0, this.internal, this.format, this.type, img);
    }
    fromData(width, height, data = null) {
        const gl = this.gl;
        this.width = width;
        this.height = height;
        data = data || null;
        gl.bindTexture(T2D, this.id);
        gl.texImage2D(T2D, 0, this.internal, width, height, 0, this.format, this.type, data);
    }
    bind(unit) {
        const gl = this.gl;
        if (unit !== undefined) {
            gl.activeTexture(gl.TEXTURE0 + (0 | unit));
        }
        gl.bindTexture(T2D, this.id);
    }
    dispose() {
        this.gl.deleteTexture(this.id);
    }
    setFilter(smooth = false, mipmap = false, miplinear = false) {
        const gl = this.gl;
        gl.texParameteri(T2D, gl.TEXTURE_MAG_FILTER, utils_1.getTextureFiltering(!!smooth, false, false));
        gl.texParameteri(T2D, gl.TEXTURE_MIN_FILTER, utils_1.getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
    }
    repeat() {
        this.wrap(this.gl.REPEAT);
    }
    clamp() {
        this.wrap(this.gl.CLAMP_TO_EDGE);
    }
    mirror() {
        this.wrap(this.gl.MIRRORED_REPEAT);
    }
    wrap(wrap) {
        const gl = this.gl;
        gl.texParameteri(T2D, gl.TEXTURE_WRAP_S, wrap);
        gl.texParameteri(T2D, gl.TEXTURE_WRAP_T, wrap);
    }
}
module.exports = Texture;
