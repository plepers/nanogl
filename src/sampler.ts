import { getTextureFiltering } from './utils';

let _UID = 0;

/**
 * This class manages GLES3 Samplers.
 */
class Sampler {
  /** Unique id for the Sampler */
  readonly _uid: number;

  /** The webgl context this Sampler belongs to */
  gl: WebGL2RenderingContext;
  /** The underlying webgl sampler */
  id: WebGLSampler;

  /**
   * @param {WebGL2RenderingContext} gl The webgl2 context this Sampler belongs to
   */
  constructor(gl: WebGL2RenderingContext) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLSampler>gl.createSampler();
    this.setFilter(true);
  }

  /**
   * Bind the underlying webgl sampler.
   * @param {number} [unit] The texture unit to make active before binding
   */
  bind(unit: number) {
    this.gl.bindSampler(unit, this.id);
  }

  /**
   * Delete all webgl objects related to this Sampler.
   */
  dispose() {
    this.gl.deleteSampler(this.id);
  }

  /**
   * Change the filtering parameters
   * @param {boolean} [smooth=false] Use linear filtering or not
   * @param {boolean} [mipmap=false] Enable mipmapping or not
   * @param {boolean} [miplinear=false] Use linear mipmapping or not
   */
  setFilter(smooth: boolean = false, mipmap: boolean = false, miplinear: boolean = false) {
    const gl = this.gl;
    gl.samplerParameteri(this.id, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
    gl.samplerParameteri(this.id, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
  }

  /**
   * Make sampler repeat :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_REPEAT`.
   */
  repeat() {
    this.wrap(this.gl.REPEAT);
  }

  /**
   * Make sampler clamp :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_CLAMP_TO_EDGE`.
   */
  clamp() {
    this.wrap(this.gl.CLAMP_TO_EDGE);
  }

  /**
   * Make sampler mirror :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_MIRRORED_REPEAT`.
   */
  mirror() {
    this.wrap(this.gl.MIRRORED_REPEAT);
  }

  /**
   * Set the `WRAP_S` and `WRAP_T` properties to the given value.
   * @param {GLenum} wrap The wrap value to use (`GL_REPEAT`, `GL_CLAMP_TO_EDGE`, etc.)
   */
  wrap(wrap: GLenum) {
    const gl = this.gl;
    gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_S, wrap);
    gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_T, wrap);
  }
}


export default Sampler