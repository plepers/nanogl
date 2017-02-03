

var _UID = 0;

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
 * @classdesc Sampler class wrapper for GLES3 Samplers
 *
 *  @param {WebGLRenderingContext} gl webgl context the sampler belongs to
 */
function Sampler( gl ){
  this._uid = _UID++;
  this.gl = gl;
  this.id = gl.createSampler();
  this.setFilter( true );
}


Sampler.prototype = {


  /**
   * Bind the sampler
   *   @param {uint} [unit] texture unit to on which bind the sampler
   */
  bind : function( unit ){
    this.gl.bindSampler( unit, this.id );
  },

  /**
   * delete the webgl sampler
   *
   */
  dispose : function( ){
    this.gl.deleteSampler( this.id );
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
    gl.samplerParameteri( this.id, gl.TEXTURE_MAG_FILTER, getFilter( !!smooth, false, false ) );
    gl.samplerParameteri( this.id, gl.TEXTURE_MIN_FILTER, filter );
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
    gl.samplerParameteri( this.id, gl.TEXTURE_WRAP_S, wrap );
    gl.samplerParameteri( this.id, gl.TEXTURE_WRAP_T, wrap );
  }

};

module.exports = Sampler;