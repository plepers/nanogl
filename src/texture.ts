import { GLContext } from './types';
import { getTextureFiltering } from './utils';

let _UID = 0;
const T2D = 0x0de1;

/**
 * @class
 * @classdesc Texture class manage TEXTURE_2D types textures
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format  =GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 *  @param {GLenum} [type    =GL_UNSIGNED_BYTE] the pixel data type, default to gl.UNSIGNED_BYTE
 *  @param {GLenum} [internal=format] the pixel internal format, default to the same value than 'format' parameter (which must be in webgl 1)
 */
class Texture {
  gl: GLContext;
  id: WebGLTexture;
  format: GLenum = 0;
  internal: GLenum = 0;
  type: GLenum = 0;
  width: number;
  height: number;
  _uid: number;

  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    this._uid = _UID++;
    this.gl = gl;
    this.id = <WebGLTexture>gl.createTexture();
    this.width = 0;
    this.height = 0;


    this.setFormat(format, type, internal);

    gl.bindTexture(T2D, this.id);
    this.setFilter(true);
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
   * set texture data from html source
   */
  fromImage(img: TexImageSource) {
    const gl = this.gl;

    this.width = img.width;
    this.height = img.height;

    gl.bindTexture(T2D, this.id);
    gl.texImage2D(T2D, 0, this.internal, this.format, this.type, img);
  }

  /**
   * Allocate texture to the given size, with optional data (TypedArray) and data type
   *  @param {number} width     the new texture's width
   *  @param {number} height    the new texture's height
   *  @param {TypedArray} [data=null]  TypedArray of texture data, can be null
   *  @param {GLenum} [dataType=GL_UNSIGNED_BYTE] can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc depending on available extensions
   */
  fromData(width: number, height: number, data: ArrayBufferView|null = null) {
    const gl = this.gl;

    this.width = width;
    this.height = height;

    data = data || null;

    gl.bindTexture(T2D, this.id);
    gl.texImage2D(T2D, 0, this.internal, width, height, 0, this.format, this.type, data);
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
    gl.bindTexture(T2D, this.id);
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
  setFilter(smooth: boolean = false, mipmap: boolean = false, miplinear: boolean = false) {
    const gl = this.gl;
    gl.texParameteri(T2D, gl.TEXTURE_MAG_FILTER, getTextureFiltering(!!smooth, false, false));
    gl.texParameteri(T2D, gl.TEXTURE_MIN_FILTER, getTextureFiltering(!!smooth, !!mipmap, !!miplinear));
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
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(T2D, gl.TEXTURE_WRAP_T, wrap);
  }
}


export = Texture