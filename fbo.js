var Texture = require( './texture' );

function getAttachmentFormat( gl, type ){
  switch( type ){
    case 1: return gl.DEPTH_COMPONENT16;
    case 2: return gl.STENCIL_INDEX8;
    case 3: return gl.DEPTH_STENCIL;
    default: throw new Error( 'unknown attachment type '+type );
  }
}


function getAttachmentType( gl, type ){
  switch( type ){
    case 1: return gl.DEPTH_ATTACHMENT;
    case 2: return gl.STENCIL_ATTACHMENT;
    case 3: return gl.DEPTH_STENCIL_ATTACHMENT;
    default: throw new Error( 'unknown attachment type '+type );
  }
}


var DEFAULT_OPTS = {};


/**
 * Provide iterator of Pixel types
 * todo : maybe overkill...
 */
function TypeChain( formats ){
  if( !Array.isArray( formats ) ){
    formats = [formats];
  }
  this.formats = formats;
  this.current = 0;
}

TypeChain.prototype = {
  next: function(){
    if( this.current >= this.formats.length ){
      return 0;
    }
    return this.formats[this.current++];
  },
  reset: function(){
    this.current = 0;
  }
};


/**
 * @gl      :   then webgl context this Fbo belongs to
 * @width   :   initial width of the fbo, the size can be later changed using Fbo#resize()
 * @height  :   initial height of the fbo, the size can be later changed using Fbo#resize()
 * @opts    :
 *    depth   <bool> : if true, a depth buffer is attached
 *    stencil <bool> : if true, a stencil buffer is attached
 *    type <Array or GLEnum> : the pixel type of the Fbo, default is gl.UNSIGNED_BYTE, can be gl.FLOAT, half.HALF_FLOAT_OES etc. you can also provide an array of types used as cascaded fallbacks
 *    format <GLEnum> : the internal pixel format, default to gl.RGB.
 *
 */
function Fbo( gl, width, height, opts )
{
  this.gl = gl;
  this.width = 0;
  this.height = 0;
  this.fbo = null;

  opts = opts || DEFAULT_OPTS;

  this.flags = (opts.depth) | (opts.stencil*2);

  this.types = new TypeChain( opts.type || gl.UNSIGNED_BYTE );

  this.color = new Texture( gl, opts.format );
  this._init();
  this.resize( width, height );
}


Fbo.prototype = {

  /**
   * Realocate Fbo size
   *  @w  :  new width
   *  @h  :  new height
   */
  resize : function( w, h ){

    if( this.width === w && this.height === h ) {
      return;
    }

    this.width  = w|0;
    this.height = h|0;
    this._allocate();
  },

  /**
   * bind the color texture of this Fbo to a sampler2D location and a unit
   * The related program must be in use.
   */
  bindColor : function( location, unit ){
    var gl = this.gl;
    gl.activeTexture( gl.TEXTURE0 + unit );
    gl.bindTexture( gl.TEXTURE_2D, this.color.id );
    gl.uniform1i( location, unit );
  },

  /**
   * Bind the Fbo and set gl viewport to it's size
   */
  bind : function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport( 0, 0, this.width, this.height );
  },

  /**
   * Clear all buffer of the Fbo.
   * The Fbo must be explicitly bound before calling this method
   */
  clear : function() {
    var gl = this.gl;
    var bits = gl.COLOR_BUFFER_BIT;
    bits |= ( this.flags & 1 ) ? gl.DEPTH_BUFFER_BIT : 0;
    bits |= ( this.flags & 2 ) ? gl.STENCIL_BUFFER_BIT : 0;
    gl.clear( bits );
  },

  /**
   * Check if the Fbo is valid,
   * The Fbo must be explicitely bound before calling this method
   */
  isValid : function(){
    var gl = this.gl;
    return ( gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE );
  },

  /**
   * return the actual pixel type of the underlying color texture (UNSIGNED_BYTE, FLOAT, HALF_FLOAT_EOS etc)
   * after possibles types has been tested
   */
  getActualType : function(){
    return this.color.type;
  },

  /**
   * delete all webgl objects related to this Fbo
   */
  dispose : function(){
    var gl = this.gl;
    if( this.attachmentBuffer ){
      gl.deleteRenderbuffer( this.attachmentBuffer );
    }
    gl.deleteFramebuffer( this.fbo );
    this.color.dispose();
    this.valid = false;
    this.gl = null;
  },


  _init : function() {
    var gl = this.gl;

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color.id, 0 );

    var attType = this.flags & 3;

    if( attType ) {
      var type   = getAttachmentType( gl, attType );
      this.attachmentBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  this.attachmentBuffer );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, type, gl.RENDERBUFFER, this.attachmentBuffer );
    }

  },


  _allocate : function(){
    var gl = this.gl;

    var attType = this.flags & 3;
    if( attType ){
      var format = getAttachmentFormat( gl, attType );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  this.attachmentBuffer );
      gl.renderbufferStorage( gl.RENDERBUFFER,  format , this.width, this.height );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  null );
    }


    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );

    var nextFmt = this.types.next();
    do {
      this.color.fromData( this.width, this.height, null, nextFmt );
      gl.getError(); // clear possible texture error
    } while( !(this.valid = this.isValid() ) && ( nextFmt = this.types.next() ) );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }

};

module.exports = Fbo;
