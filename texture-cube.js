var _UID = 0;
var TCUBE = 0x8513;

/*
 * compute filtering enum, return one of the following :
 *  NEAREST
 *  LINEAR
 *  NEAREST_MIPMAP_NEAREST
 *  LINEAR_MIPMAP_NEAREST
 *  NEAREST_MIPMAP_LINEAR
 *  LINEAR_MIPMAP_LINEAR
 */
function getFilter( smooth, mipmap, miplinear ){
  return 0x2600 | (+smooth) | (+mipmap<<8) | ( +( mipmap && miplinear )<<1 );
}


/**
 * @class
 * @classdesc Texture class manage TEXTURE_2D types textures
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format=GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 */
function Texture( gl, format ){
  this._uid = _UID++;
  this.gl = gl;
  this.id = this.gl.createTexture();
  this.width  = 0;
  this.height = 0;
  this.format = format || gl.RGB;
  this.type   = gl.UNSIGNED_BYTE;

  gl.bindTexture( TCUBE, this.id );
  this.setFilter( true );
  this.clamp()

}


Texture.prototype = {

  /**
   * set texture data from html source
   *   @param {TexImageSource} img the source. Can be ImageBitmap, ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement
   */
  fromImages : function( imgs ){
    var gl   = this.gl,
        fmt  = this.format,
        type = this.type;

    this.width  = imgs[0].width;
    this.height = imgs[0].height;

    gl.bindTexture( TCUBE, this.id );

    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, fmt, fmt, type, imgs[0] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, fmt, fmt, type, imgs[1] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, fmt, fmt, type, imgs[2] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, fmt, fmt, type, imgs[3] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, fmt, fmt, type, imgs[4] );
    gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, fmt, fmt, type, imgs[5] );
  },


  /**
   * Bind the texture
   *   @param {uint} [unit=undefined] optional texture unit to make active before binding
   */
  bind : function( unit ){
    var gl = this.gl;
    if( unit !== undefined ){
      gl.activeTexture( gl.TEXTURE0 + (0|unit) );
    }
    gl.bindTexture( TCUBE, this.id );
  },

  /**
   * delete the webgl texture
   *
   */
  dispose : function( ){
    this.gl.deleteTexture( this.id );
    this.id = null;
    this.gl = null;
  },

  /**
   * Change the filtering parameters
   *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
   *   @param {boolean} [mipmap=false]    if true, enable mipmaping
   *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
   */
  setFilter : function( smooth, mipmap, miplinear ){
    var gl = this.gl;
    var filter = getFilter( !!smooth, !!mipmap, !!miplinear);
    gl.texParameteri( TCUBE, gl.TEXTURE_MAG_FILTER, getFilter( !!smooth, false, false ) );
    gl.texParameteri( TCUBE, gl.TEXTURE_MIN_FILTER, filter );
  },

  /**
   * Set both WRAP_S and WRAP_T property to gl.REPEAT
   */
  repeat : function( ){
    this.wrap( this.gl.REPEAT );
  },

  /**
   * Set both WRAP_S and WRAP_T property to gl.CLAMP_TO_EDGE
   */
  clamp : function( ){
    this.wrap( this.gl.CLAMP_TO_EDGE );
  },

  /**
   * Set both WRAP_S and WRAP_T property to gl.MIRRORED_REPEAT
   */
  mirror : function( ){
    this.wrap( this.gl.MIRRORED_REPEAT );
  },

  /**
   * Set both WRAP_S and WRAP_T property to the given value
   *  @param {GLenum} wrap the wrap enum
   */
  wrap : function( wrap ) {
    var gl = this.gl;
    gl.texParameteri( TCUBE, gl.TEXTURE_WRAP_S, wrap );
    gl.texParameteri( TCUBE, gl.TEXTURE_WRAP_T, wrap );
  }

};

module.exports = Texture;