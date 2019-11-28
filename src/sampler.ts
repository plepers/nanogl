import { getTextureFiltering } from './utils';

let _UID = 0;

/**
 * @class
 * @classdesc Sampler class wrapper for GLES3 Samplers
 *
 *  @param {WebGLRenderingContext} gl webgl context the sampler belongs to
 */
class Sampler {
  readonly _uid: number;

  gl: WebGL2RenderingContext;
  id: WebGLSampler;

  constructor(gl: WebGL2RenderingContext) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLSampler>gl.createSampler();
    this.setFilter(true);
  }

  /**
   * Bind the sampler
   *   @param {uint} [unit] texture unit to on which bind the sampler
   */
  bind(unit: number) {
    this.gl.bindSampler(unit, this.id);
  }

  /**
   * delete the webgl sampler
   *
   */
  dispose() {
    this.gl.deleteSampler(this.id);
  }

  /**
   * Change the filtering parameters
   *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
   *   @param {boolean} [mipmap=false]    if true, enable mipmaping
   *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
   */
  setFilter(smooth: boolean = false, mipmap: boolean = false, miplinear: boolean = false) {
    const gl = this.gl;
    gl.samplerParameteri(this.id, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
    gl.samplerParameteri(this.id, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
  }

  /**
   * Set both WRAP_S and WRAP_T property to gl.REPEAT
   */
  repeat() {
    this.wrap(this.gl.REPEAT);
  }

  /**
   * Set both WRAP_S and WRAP_T property to gl.CLAMP_TO_EDGE
   */
  clamp() {
    this.wrap(this.gl.CLAMP_TO_EDGE);
  }

  /**
   * Set both WRAP_S and WRAP_T property to gl.MIRRORED_REPEAT
   */
  mirror() {
    this.wrap(this.gl.MIRRORED_REPEAT);
  }

  /**
   * Set both WRAP_S and WRAP_T property to the given value
   *  @param {GLenum} wrap the wrap enum
   */
  wrap(wrap: GLenum) {
    const gl = this.gl;
    gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_S, wrap);
    gl.samplerParameteri(this.id, gl.TEXTURE_WRAP_T, wrap);
  }
}


export = Sampler