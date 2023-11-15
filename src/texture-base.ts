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
 * This class is the base for all texture classes.
 */
export default abstract class AbstractTexture {
  /** The type of webgl texture (`TEXTURE_2D`, `TEXTURE_CUBE`, etc) */
  readonly textureType : TextureType = TextureType.NONE;

  /** The webgl context this Texture belongs to */
  readonly gl: GLContext;
  /** The underlying webgl texture */
  readonly id: WebGLTexture;

  /** The width of the texture */
  width : number;
  /** The height of the texture */
  height: number;

  /** The pixel format of the texture */
  format  : GLenum = 0;
  /** The pixel internal format of the texture */
  internal: GLenum = 0;
  /** The pixel data type of the texture */
  type    : GLenum = 0;

  /** Unique id for the Texture */
  readonly _uid: number;

  /** The binding point for this Texture */
  abstract _target : GLenum

  /**
   * @param {GLContext} gl The webgl context this Texture belongs to
   * @param {GLenum} [format=GL_RGB]  The pixel format of the texture (`GL_RGB`, `GL_RGBA`, etc.)
   * @param {GLenum} [type=GL_UNSIGNED_BYTE]  The pixel data type of the texture (`GL_UNSIGNED_BYTE`, `GL_FLOAT`, etc.)
   * @param {GLenum} [internal=format]  The pixel internal format of the texture, defaults to the `format` parameter value
   */
  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLTexture>gl.createTexture();
    this.width = 0;
    this.height = 0;
    this.setFormat(format, type, internal);
  }

  /**
   * Define underlying format, internal format and data type of the texture.
   *  @param {GLenum} [format=GL_RGB]  The pixel format of the texture (`GL_RGB`, `GL_RGBA`, etc.)
   * @param {GLenum} [type=GL_UNSIGNED_BYTE]  The pixel data type of the texture (`GL_UNSIGNED_BYTE`, `GL_FLOAT`, etc.)
   * @param {GLenum} [internal=this.format]  The pixel internal format of the texture, defaults to the `format` parameter value
   */
  setFormat(format?: GLenum, type?: GLenum, internal?: GLenum) {
    this.format = format || this.gl.RGB;
    this.internal = internal || this.format;
    this.type = type || this.gl.UNSIGNED_BYTE;
  }

  /**
   * Bind the underlying webgl texture.
   * @param {number} [unit] The texture unit to make active before binding
   */
  bind(unit?: number) {
    const gl = this.gl;
    if (unit !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + (0 | unit));
    }
    gl.bindTexture(this._target, this.id);
  }

  /**
   * Delete all webgl objects related to this Texture.
   */
  dispose() {
    this.gl.deleteTexture(this.id);
  }

  /**
   * Change the filtering parameters
   * @param {boolean} [smooth=false] Use linear filtering or not
   * @param {boolean} [mipmap=false] Enable mipmapping or not
   * @param {boolean} [miplinear=false] Use linear mipmapping or not
   */
  setFilter(smooth: boolean = false, mipmap: boolean = false, miplinear: boolean = false) : this {
    const gl = this.gl;
    gl.texParameteri(this._target, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
    gl.texParameteri(this._target, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
    return this;
  }

  /**
   * Make texture repeat :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_REPEAT`.
   */
  repeat() :this {
    this.wrap(this.gl.REPEAT);
    return this;
  }

  /**
   * Make texture clamp :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_CLAMP_TO_EDGE`.
   */
  clamp() : this {
    this.wrap(this.gl.CLAMP_TO_EDGE);
    return this;
  }

  /**
   * Make texture mirror :
   * Set the `WRAP_S` and `WRAP_T` properties to `GL_MIRRORED_REPEAT`.
   */
  mirror() : this {
    this.wrap(this.gl.MIRRORED_REPEAT);
    return this;
  }

  /**
   * Set the `WRAP_S` and `WRAP_T` properties to the given value.
   * @param {GLenum} wrap The wrap value to use (`GL_REPEAT`, `GL_CLAMP_TO_EDGE`, etc.)
   */
  wrap(wrap: GLenum) : this {
    const gl = this.gl;
    gl.texParameteri(this._target, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(this._target, gl.TEXTURE_WRAP_T, wrap);
    return this;
  }
}
