import { isWebgl2 } from './types';
let _UID = 0;
const RENDERBUFFER = 0x8d41;
class RenderBuffer {
    constructor(gl, format = gl.DEPTH_COMPONENT16, msaaSamples = 0) {
        this.gl = gl;
        this.format = format;
        this._maxSamples = 0;
        this._samples = 0;
        this.width = 0;
        this.height = 0;
        this._uid = _UID++;
        this.id = gl.createRenderbuffer();
        this._maxSamples = isWebgl2(gl) ? gl.getParameter(gl.MAX_SAMPLES) : 0;
        this._samples = Math.min(msaaSamples, this._maxSamples);
    }
    multisampling(samples) {
        samples = Math.min(samples, this._maxSamples);
        if (this._samples !== samples) {
            this._samples = samples;
            this._storage();
        }
    }
    allocate(width, height) {
        if (this.width !== width || this.height !== height) {
            this.width = width;
            this.height = height;
            this._storage();
        }
    }
    bind() {
        this.gl.bindRenderbuffer(RENDERBUFFER, this.id);
    }
    dispose() {
        this.gl.deleteRenderbuffer(this.id);
    }
    _storage() {
        const gl = this.gl;
        gl.bindRenderbuffer(RENDERBUFFER, this.id);
        if (this._samples > 0 && isWebgl2(gl)) {
            gl.renderbufferStorageMultisample(RENDERBUFFER, this._samples, this.format, this.width, this.height);
        }
        else {
            gl.renderbufferStorage(RENDERBUFFER, this.format, this.width, this.height);
        }
        gl.bindRenderbuffer(RENDERBUFFER, null);
    }
}
export default RenderBuffer;
