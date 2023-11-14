import { GLContext, isWebgl2 } from './types';

let _UID = 0;

const RENDERBUFFER = 0x8d41;

/**
 * This class manages renderbuffers.
 */
class RenderBuffer {
  /** The webgl context this RenderBuffer belongs to */
  readonly gl: GLContext;
  /** The underlying webgl renderbuffer */
  readonly id: WebGLRenderbuffer;
  /** The number of samples used for the renderbuffer storage (webgl2 only) */
  readonly samples: number = 0;
   /** The pixel internal format of the renderbuffer */
  readonly format: GLenum;

  /** The width of the renderbuffer */
  width: number;
  /** The height of the renderbuffer */
  height: number;

  /** Unique id for the RenderBuffer */
  readonly _uid: number;
  /** Whether the RenderBuffer is valid or not */
  private _valid: boolean;

  /**
    * @param {GLContext} gl  The webgl context this RenderBuffer belongs to
    * @param {GLenum} [format=GL_DEPTH_COMPONENT16]  The pixel internal format of the renderbuffer (`GL_RGB`, `GL_RGBA`, etc.)
    * @param {number} [samples=0]  The number of samples to be used for the renderbuffer storage (webgl2 only)
    */
  constructor(gl: GLContext, format: GLenum, samples : number = 0) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLRenderbuffer>gl.createRenderbuffer();

    if( samples > 0 && isWebgl2(gl) ){
      const maxSamples = gl.getParameter( gl.MAX_SAMPLES )
      this.samples = (samples > maxSamples) ? maxSamples : samples;
    }

    this.width = 0;
    this.height = 0;
    this.format = format || gl.DEPTH_COMPONENT16;

    this._valid = false;

    // Dummy allocation needed
    // on some platform (chrome 57, osx, nvidia), gl.framebufferRenderbuffer raise
    // an INVALID_OPERATION if a RB is attached before it storage is allocated.
    this._storage();
  }

  /**
   * Resize the RenderBuffer.
   *  @param {number} w The new width
   *  @param {number} h The new height
   */
  resize(w: number, h: number) {
    if (this.width !== w || this.height !== h) {
      this.width = w;
      this.height = h;
      this._valid = false;
    }
  }

  /**
   * Check renderbuffer for validity and allocate it if invalid.
   * This method may leave RENDERBUFFER binding point empty.
   */
  allocate() {
    if (!this._valid && this.width > 0 && this.height > 0) {
      this._storage();
      this._valid = true;
    }
  }

  /**
   * Bind the underlying webgl renderbuffer.
   */
  bind() {
    this.gl.bindRenderbuffer(RENDERBUFFER, this.id);
  }

  /**
   * Delete all webgl objects related to this RenderBuffer.
   */
  dispose() {
    this.gl.deleteRenderbuffer(this.id);
  }

  /**
   * Allocate webgl renderbuffer with current parameters.
   */
  _storage() {
    const gl = this.gl;
    gl.bindRenderbuffer(RENDERBUFFER, this.id);
    if( this.samples > 0 && isWebgl2(gl) ){
      gl.renderbufferStorageMultisample(RENDERBUFFER, this.samples, this.format, this.width, this.height);
    } else {
      gl.renderbufferStorage(RENDERBUFFER, this.format, this.width, this.height);
    }
    gl.bindRenderbuffer(RENDERBUFFER, null);
  }
}


export default RenderBuffer