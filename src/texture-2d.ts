import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';

const GL_TEXTURE_2D = 0x0de1;

/**
 * @class
 * @classdesc Texture class manage TEXTURE_2D types textures
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format  =GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 *  @param {GLenum} [type    =GL_UNSIGNED_BYTE] the pixel data type, default to gl.UNSIGNED_BYTE
 *  @param {GLenum} [internal=format] the pixel internal format, default to the same value than 'format' parameter (which must be in webgl 1)
 */
export default class Texture2D extends AbstractTexture {

  readonly textureType : TextureType.TEXTURE_2D = TextureType.TEXTURE_2D;

  _target: GLenum = GL_TEXTURE_2D;


  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    super( gl, format, type, internal );

    gl.bindTexture(GL_TEXTURE_2D, this.id);
    this.setFilter(true);
  }


  /**
   * set texture data from html source
   */
  fromImage(img: TexImageSource) {
    const gl = this.gl;

    this.width = img.width;
    this.height = img.height;

    gl.bindTexture(GL_TEXTURE_2D, this.id);
    gl.texImage2D(GL_TEXTURE_2D, 0, this.internal, this.format, this.type, img);
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

    gl.bindTexture(GL_TEXTURE_2D, this.id);
    gl.texImage2D(GL_TEXTURE_2D, 0, this.internal, width, height, 0, this.format, this.type, data);
  }


}
