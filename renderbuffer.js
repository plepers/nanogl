import { isWebgl2 } from './types';
let _UID = 0;
const RENDERBUFFER = 0x8d41;
class RenderBuffer {
    constructor(gl, format, samples = 0) {
        this.samples = 0;
        this._uid = _UID++;
        this.gl = gl;
        this.samples = samples;
        this.id = gl.createRenderbuffer();
        this.width = 0;
        this.height = 0;
        this.format = format || gl.DEPTH_COMPONENT16;
        this._valid = false;
        this._storage();
    }
    resize(w, h) {
        if (this.width !== w || this.height !== h) {
            this.width = w;
            this.height = h;
            this._valid = false;
        }
    }
    allocate() {
        if (!this._valid && this.width > 0 && this.height > 0) {
            this._storage();
            this._valid = true;
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
        if (this.samples > 0 && isWebgl2(gl)) {
            gl.renderbufferStorageMultisample(RENDERBUFFER, this.samples, this.format, this.width, this.height);
        }
        else {
            gl.renderbufferStorage(RENDERBUFFER, this.format, this.width, this.height);
        }
        gl.bindRenderbuffer(RENDERBUFFER, null);
    }
}
export default RenderBuffer;
