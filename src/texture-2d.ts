import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';

const GL_TEXTURE_2D = 0x0de1;

/**
 * This class manages TEXTURE_2D type textures.
 */
export default class Texture2D extends AbstractTexture {

  readonly textureType : TextureType.TEXTURE_2D = TextureType.TEXTURE_2D;

  _target: GLenum = GL_TEXTURE_2D;


  /**
   * @param {WebGLRenderingContext} gl The webgl context this Texture belongs to
   * @param {GLenum} [format=GL_RGB]  The pixel format of the texture (`GL_RGB`, `GL_RGBA`, etc.)
   * @param {GLenum} [type=GL_UNSIGNED_BYTE]  The pixel data type of the texture (`GL_UNSIGNED_BYTE`, `GL_FLOAT`, etc.)
   * @param {GLenum} [internal="format parameter value"]  The pixel internal format of the texture, defaults to the `format` parameter value
   */
  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    super( gl, format, type, internal );

    gl.bindTexture(GL_TEXTURE_2D, this.id);
    this.setFilter(true);
  }


  /**
   * Set the texture data from an HTML source.
   * @param img The HTML image, canvas or video element to use as source
   */
  fromImage(img: TexImageSource) {
    const gl = this.gl;

    this.width = img.width;
    this.height = img.height;

    gl.bindTexture(GL_TEXTURE_2D, this.id);
    gl.texImage2D(GL_TEXTURE_2D, 0, this.internal, this.format, this.type, img);
  }

  /**
   * Set the texture data from a TypedArray.
   * You can also allocate an empty texture by providing only the size.
   *  @param {number} width The width of the texture
   *  @param {number} height The height of the texture
   *  @param {TypedArray|null} [data=null] The data to fill the texture with, or null to allocate an empty texture
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
