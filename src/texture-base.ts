import { GLContext } from './types';
import { getTextureFiltering } from './utils';
import TextureCube from './texture-cube';
import Texture2D from './texture-2d';

let _UID = 0;


export enum TextureType {
    NONE             = 0     ,
    TEXTURE_2D       = 0x0de1,
    TEXTURE_2D_ARRAY = 0x8C1A,
    TEXTURE_CUBE     = 0x8513,
    TEXTURE_3D       = 0x806F,
}


export type Texture = TextureCube | Texture2D;


/**
 * @class
 * @classdesc Texture class manage TEXTURE_2D types textures
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format  =GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 *  @param {GLenum} [type    =GL_UNSIGNED_BYTE] the pixel data type, default to gl.UNSIGNED_BYTE
 *  @param {GLenum} [internal=format] the pixel internal format, default to the same value than 'format' parameter (which must be in webgl 1)
 */
export default abstract class AbstractTexture {

  readonly textureType : TextureType = TextureType.NONE;
  
  readonly gl: GLContext;
  readonly id: WebGLTexture;


  width : number;
  height: number;

  format  : GLenum = 0;
  internal: GLenum = 0;
  type    : GLenum = 0;

  readonly _uid: number;

  abstract _target : GLenum

  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
      
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLTexture>gl.createTexture();
    this.width = 0;
    this.height = 0;
    this.setFormat(format, type, internal);
  }

  /**
   * define underlying format, internal format and data type of texture
   *  @param {GLenum} [format  =GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
   *  @param {GLenum} [type    =GL_UNSIGNED_BYTE] the pixel data type, default to gl.UNSIGNED_BYTE
   *  @param {GLenum} [internal=format] the pixel internal format, default to the same value than 'format' parameter (which must be in webgl 1)
   */
  setFormat(format?: GLenum, type?: GLenum, internal?: GLenum) {
    this.format = format || this.gl.RGB;
    this.internal = internal || this.format;
    this.type = type || this.gl.UNSIGNED_BYTE;
  }



  /**
   * Bind the texture
   *   @param {uint} [unit=undefined] optional texture unit to make active before binding
   */
  bind(unit?: number) {
    const gl = this.gl;
    if (unit !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + (0 | unit));
    }
    gl.bindTexture(this._target, this.id);
  }

  /**
   * delete the webgl texture
   *
   */
  dispose() {
    this.gl.deleteTexture(this.id);
  }

  /**
   * Change the filtering parameters
   *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
   *   @param {boolean} [mipmap=false]    if true, enable mipmaping
   *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
   */
  setFilter(smooth: boolean = false, mipmap: boolean = false, miplinear: boolean = false) : this {
    const gl = this.gl;
    gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
    gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
    return this;
  }

  /**
   * Set both WRAP_S and WRAP_T property to gl.REPEAT
   */
  repeat() :this {
    this.wrap(this.gl.REPEAT);
    return this;
  }
  
  /**
   * Set both WRAP_S and WRAP_T property to gl.CLAMP_TO_EDGE
   */
  clamp() : this {
    this.wrap(this.gl.CLAMP_TO_EDGE);
    return this;
  }
  
  /**
   * Set both WRAP_S and WRAP_T property to gl.MIRRORED_REPEAT
   */
  mirror() : this {
    this.wrap(this.gl.MIRRORED_REPEAT);
    return this;
  }
  
  /**
   * Set both WRAP_S and WRAP_T property to the given value
   *  @param {GLenum} wrap the wrap enum
   */
  wrap(wrap: GLenum) : this {
    const gl = this.gl;
    gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrap);
    return this;
  }
}
