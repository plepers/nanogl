import { GLContext } from './types';

let _UID = 0;

const RENDERBUFFER = 0x8d41;

/**
 * @class
 * @classdesc RenderBuffer class manage renderbuffers
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format=DEPTH_COMPONENT16] the pixel internal format, default to gl.DEPTH_COMPONENT16
 */
class RenderBuffer {
  gl: GLContext;
  id: WebGLRenderbuffer;
  width: number;
  height: number;
  format: GLenum;

  readonly _uid: number;
  private _valid: boolean;

  constructor(gl: GLContext, format: GLenum) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLRenderbuffer>gl.createRenderbuffer();

    this.width = 0;
    this.height = 0;
    this.format = format || gl.DEPTH_COMPONENT16;

    this._valid = false;

    // Dummy allocation needed
    // on some platform (chrome 57, osx, nvidia), gl.framebufferRenderbuffer raise
    // an INVALID_OPERATION if a RB is attached before it storage is set.
    this._storage();
  }

  /**
   *
   *
   */
  resize(w: number, h: number) {
    if (this.width !== w || this.height !== h) {
      this.width = w;
      this.height = h;
      this._valid = false;
    }
  }

  /**
   * check renderbuffer for  validity and allocate it if invalid.
   * this method may leave RENDERBUFFER binding point empty
   */
  allocate() {
    if (!this._valid && this.width > 0 && this.height > 0) {
      this._storage();
      this._valid = true;
    }
  }

  /**
   * Bind the renderbuffer
   */
  bind() {
    this.gl.bindRenderbuffer(RENDERBUFFER, this.id);
  }

  /**
   * delete the webgl renderbuffer
   *
   */
  dispose() {
    this.gl.deleteRenderbuffer(this.id);
  }

  /*
   * actual RB gl allocation
   */
  _storage() {
    const gl = this.gl;
    gl.bindRenderbuffer(RENDERBUFFER, this.id);
    gl.renderbufferStorage(RENDERBUFFER, this.format, this.width, this.height);
    gl.bindRenderbuffer(RENDERBUFFER, null);
  }
}


export = RenderBuffer