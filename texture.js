

function Texture( gl ){
  this.gl = gl;

  this.id = this.gl.createTexture();

  this.width  = 0;
  this.height = 0;

  gl.bindTexture( gl.TEXTURE_2D, this.id );
  this.setFilter( true );
  this.setRepeat( );
  gl.bindTexture( gl.TEXTURE_2D, null );

}


Texture.prototype = {


  fromImage : function( img, alpha ){
    var gl = this.gl;

    this.width  = img.width;
    this.height = img.height;

    var type = alpha ? gl.RGBA : gl.RGB;

    gl.bindTexture( gl.TEXTURE_2D, this.id );
    gl.texImage2D(  gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, img );
    gl.bindTexture( gl.TEXTURE_2D, null );

  },


  fromData : function( width, height, pixelFormat, data, dataType ){
    var gl = this.gl;

    pixelFormat = pixelFormat || gl.RGBA;
    dataType =    dataType    || gl.UNSIGNED_BYTE;
    data = data || null;

    this.width  = width;
    this.height = height;
    gl.bindTexture( gl.TEXTURE_2D, this.id );
    gl.texImage2D( gl.TEXTURE_2D, 0, pixelFormat, width, height, 0, pixelFormat, dataType, data );
    gl.bindTexture( gl.TEXTURE_2D, null );
  },


  bind : function( ){
    this.gl.bindTexture( this.gl.TEXTURE_2D, this.id );
  },


  dispose : function( ){
    this.gl.deleteTexture( this.id );
    this.id = null;
    this.gl = null;
  },


  setFilter : function( smooth, mipmap, miplinear ){
    var gl = this.gl;

    smooth      = !!smooth;
    mipmap      = !!mipmap;
    miplinear   = !!miplinear;

    var filter = smooth ? (
      mipmap ? (
        miplinear ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR_MIPMAP_NEAREST
      ) : gl.LINEAR
    ) : (
      mipmap ? (
        miplinear ? gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST
      ) : gl.NEAREST
    );

    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, smooth? gl.LINEAR : gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter );
  },


  setRepeat : function( flag ){
    var gl = this.gl;

    var wrap =  flag ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap );
  }

};

module.exports = Texture;