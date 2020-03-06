import AbstractTexture, { TextureType } from './texture-base';
import { GLContext } from './types';

const GL_TEXTURE_CUBE = 0x8513;

/**
 * @class
 * @classdesc Texture class manage TEXTURE_CUBE types textures
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format  =GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 *  @param {GLenum} [type    =GL_UNSIGNED_BYTE] the pixel data type, default to gl.UNSIGNED_BYTE
 *  @param {GLenum} [internal=format] the pixel internal format, default to the same value than 'format' parameter (which must be in webgl 1)
 */
export default class TextureCube extends AbstractTexture {

  readonly textureType : TextureType.TEXTURE_CUBE = TextureType.TEXTURE_CUBE;

  _target: GLenum = GL_TEXTURE_CUBE;


  constructor(gl: GLContext, format?: GLenum, type?: GLenum, internal?: GLenum) {
    super( gl, format, type, internal );

    gl.bindTexture(GL_TEXTURE_CUBE, this.id);
    this.setFilter(true);
  }


   
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
