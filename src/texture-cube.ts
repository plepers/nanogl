import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';

const GL_TEXTURE_CUBE = 0x8513;

/**
 * This class manages TEXTURE_CUBE type textures.
 */
export default class TextureCube extends AbstractTexture {

  readonly textureType : TextureType.TEXTURE_CUBE = TextureType.TEXTURE_CUBE;

  _target: GLenum = GL_TEXTURE_CUBE;


  /**
   * @param {GLContext} gl The webgl context this Texture belongs to
   * @param {GLenum} [format=GL_RGB]  The pixel format of the texture (`GL_RGB`, `GL_RGBA`, etc.), defaults to `GL_RGB`
   * @param {GLenum} [type=GL_UNSIGNED_BYTE]  The pixel data type of the texture (`GL_UNSIGNED_BYTE`, `GL_FLOAT`, etc.), defaults to `GL_UNSIGNED_BYTE`
   * @param {GLenum} [internal=format]  The pixel internal format of the texture, defaults to the `format` parameter value
   */
  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    super( gl, format, type, internal );

    gl.bindTexture(GL_TEXTURE_CUBE, this.id);
    this.setFilter(true);
  }


  /**
   * Set the texture data from a list of HTML sources.
   * @param imgs The list of HTML image, canvas or video elements to use as source
   */
  fromImages( imgs: TexImageSource[] ){
    var gl       = this.gl,
        fmt      = this.format,
        internal = this.internal,
        type     = this.type;

    this.width  = imgs[0].width;
    this.height = imgs[0].height;

    gl.bindTexture( GL_TEXTURE_CUBE, this.id );

    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, internal, fmt, type, imgs[0] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, internal, fmt, type, imgs[1] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, internal, fmt, type, imgs[2] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, internal, fmt, type, imgs[3] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, internal, fmt, type, imgs[4] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, internal, fmt, type, imgs[5] );
  }

}
