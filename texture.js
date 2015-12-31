var _UID = 0;


/**
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
 * Helper for TEXTURE_2D objects
 *  @gl  : the gl context the texture belongs to
 *  @format : the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
 */
function Texture( gl, format ){
  this._uid = _UID++;
  this.gl = gl;
  this.id = this.gl.createTexture();
  this.width  = 0;
  this.height = 0;
  this.format = format || gl.RGB;
  this.type   = gl.UNSIGNED_BYTE;

  gl.bindTexture( gl.TEXTURE_2D, this.id );
  this.setFilter( true );
  this.clamp( );
  gl.bindTexture( gl.TEXTURE_2D, null );
}


Texture.prototype = {

  /**
   * set texture data from image ( or canvas or video )
   *
   */
  fromImage : function( img ){
    var gl = this.gl;

    this.width  = img.width;
    this.height = img.height;

    gl.bindTexture( gl.TEXTURE_2D, this.id );
    gl.texImage2D(  gl.TEXTURE_2D, 0, this.format, this.format, this.type, img );
    gl.bindTexture( gl.TEXTURE_2D, null );
  },

  /**
   * allocate texture to the gien size, with optional data (TypedArray) and data type
   *  @width : the new texture's width
   *  @height : the new texture's height
   *  @data : TypedArray of texture data, can be null
   *  @dataType : default to gl.UNSIGNED_BYTE, can also be gl.FLOAT, half.HALF_FLOAT_OES etc depending on available extensions
   */
  fromData : function( width, height, data, dataType ){
    var gl = this.gl;

    this.width  = width;
    this.height = height;

    data = data || null;
    this.type =    dataType || gl.UNSIGNED_BYTE;

    gl.bindTexture( gl.TEXTURE_2D, this.id );
    gl.texImage2D( gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, data );
    gl.bindTexture( gl.TEXTURE_2D, null );
  },

  /**
   * Bind the texture
   *
   */
  bind : function( ){
    this.gl.bindTexture( this.gl.TEXTURE_2D, this.id );
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
   *   @smooth : if true, use LINEAR filtering
   *   @mipmap : if true, enable mipmaping
   *   @miplinear : if true, use linear Mipmapping
   */
  setFilter : function( smooth, mipmap, miplinear ){
    var gl = this.gl;

    smooth      = !!smooth;
    mipmap      = !!mipmap;
    miplinear   = !!miplinear;

    var filter = getFilter( smooth, mipmap, miplinear);

    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, getFilter( smooth, false, false ) );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter );
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
   *  @glenum :  the wrap enum
   */
  wrap : function( glenum ) {
    var gl = this.gl;
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, glenum );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, glenum );
  }

};

module.exports = Texture;