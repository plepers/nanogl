"use strict";
const utils_1 = require("./utils");
let _UID = 0;
class Sampler {
    constructor(gl) {
        this._uid = _UID++;
        this.gl = gl;
        this.id = gl.createSampler();
        this.setFilter(true);
    }
    bind(unit) {
        this.gl.bindSampler(unit, this.id);
    }
    dispose() {
        this.gl.deleteSampler(this.id);
    }
    setFilter(smooth = false, mipmap = false, miplinear = false) {
        const gl = this.gl;
        gl.samplerParameteri(this.id, gl.TEXTURE_MAG_FILTER, utils_1.getTextureFiltering(!!smooth, false, false));
        gl.samplerParameteri(this.id, gl.TEXTURE_MIN_FILTER, utils_1.getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
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
        gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_S, wrap);
        gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_T, wrap);
    }
}
module.exports = Sampler;
