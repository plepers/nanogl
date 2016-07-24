var Texture = require( './texture' );


/**
 * @class
 * @param {WebGLRenderingContext} gl      the webgl context this Fbo belongs to
 * @param {uint} width   initial width of the fbo, the size can be later changed using Fbo#resize()
 * @param {uint} height  initial height of the fbo, the size can be later changed using Fbo#resize()
 * @param {Object} [opts]
 * @param {boolean} [opts.depth=false] if true, a depth renderbuffer is attached
 * @param {boolean} [opts.stencil=false] if true, a stencil renderbuffer is attached
 * @param {boolean} [opts.depthTex=false] if true, try to create a texture for depth/stencil attachment. Fallback to a RenderBuffer if WEBGL_depth_texture is not enabled
 * @param {GLenum|GLenum[]} [opts.type=GL_UNSIGNED_BYTE] the pixel type of the Fbo, can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc. you can also provide an array of types used as cascaded fallbacks
 * @param {GLenum} [opts.format=GL_RGB] the internal pixel format.
 *
 */
function Fbo( gl, width, height, opts )
{
  this.gl = gl;
  this.width = 0;
  this.height = 0;
  this.fbo = null;
  this._depthTexExt = null;

  opts = opts || DEFAULT_OPTS;

  var flags =  ( opts.depth ) |
                ( opts.stencil <<1) |
                ( (opts.depth && opts.depthTex) <<2);

  var types = opts.type || gl.UNSIGNED_BYTE;
  this.types = Array.isArray( types ) ? types : [types];

  this.color      = new Texture( gl, opts.format );
  this.attachment = new DepthStencilAttachment( this, flags );

  this._init();
  this.resize( width, height );
}


Fbo.prototype = {

  /**
   * Resize FBO attachments
   *  @param {uint} w new width
   *  @param {uint} h new height
   */
  resize : function( w, h ){
    if( this.width !== w || this.height !== h ) {
      this.width  = w|0;
      this.height = h|0;
      this._allocate();
    }
  },

  /**
   * Bind the color texture of this Fbo to a sampler2D location and a unit
   * The related program must be in use.
   * @param {WebGLUniformLocation} location the program's sampler to bind the textue to
   * @param {} unit the texture unit to use
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
    var bits = gl.COLOR_BUFFER_BIT | this.attachment.clearBits();
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
   * return true if depth texture is available and set for this fbo
   */
  isDepthTexture : function(){
    return this.attachment.flags & 4;
  },

  /**
   * return depth Texture if set
   */
  getDepthTexture : function(){
    if( this.attachment.flags & 4 ){
      return this.attachment.buffer;
    }
    return null;
  },

  /**
   * Delete all webgl objects related to this Fbo (fbo, color attachment and depth/stencil renderbuffer )
   */
  dispose : function(){
    var gl = this.gl;
    gl.deleteFramebuffer( this.fbo );
    this.color.dispose();
    this.attachment.dispose();
    this.valid = false;
    this.gl = null;
  },


  // create render buffers and set attchment points
  _init : function() {
    var gl = this.gl;

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color.id, 0 );

    this.attachment._init();
  },

  // (re)allocate render buffers to size
  _allocate : function(){
    var gl = this.gl;

    this.attachment._allocate();

    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );

    var tIndex = 0;
    var nextFmt = this.types[tIndex];
    do {
      this.color.fromData( this.width, this.height, null, nextFmt );
      gl.getError(); // clear possible texture error
    } while( !(this.valid = this.isValid() ) && ( nextFmt = this.types[++tIndex] ) );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  }


};



//---------------------------------
//         Depth/Stencil Attachment
//---------------------------------

function DepthStencilAttachment( fbo, flags ){
  this.fbo   = fbo;
  this.flags = flags;
  this.buffer = null;
  this._depthTexExt = null;

  var gl = fbo.gl;

  // activate extension and
  // discard depthTex if extension unavailable
  if( this.flags & 4 ){
    this._depthTexExt = gl.getExtension( 'WEBGL_depth_texture' ) ||
                        gl.getExtension( 'WEBKIT_WEBGL_depth_texture' ) ||
                        gl.getExtension( 'MOZ_WEBGL_depth_texture' );

    if( this._depthTexExt === null ){
      this.flags = this.flags | ~4;
    }
  }
}


DepthStencilAttachment.prototype = {

  _init : function(){
    var gl = this.fbo.gl;
    var attType = this.flags & 3;
    var depth = null;

    if( this.flags & 4 ){
      depth = new Texture( gl, getTextureFormat( gl, attType ) );
      depth.fromData( this.fbo.width, this.fbo.height, null, getTextureInternalFormat( gl, attType ) );

      if( gl.getError() === gl.INVALID_VALUE ){
        // depth texture not supported
        this.flags = this.flags & ~4;
        depth.dispose();
        this._allocate();
        return;
      }

      gl.framebufferTexture2D( gl.FRAMEBUFFER, getAttachmentType( gl, attType ), gl.TEXTURE_2D, depth.id, 0 );

    } else if( attType ){
      depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  depth );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, getAttachmentType( gl, attType ), gl.RENDERBUFFER, depth );
    }

    this.buffer = depth;
  },


  _allocate : function(){
    var gl = this.fbo.gl;
    if( this.flags & 4 ){
      this.buffer.fromData( this.fbo.width, this.fbo.height, null, getTextureInternalFormat( gl, this.flags & 3 ) );
    } else if( this.flags & 3 ){
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  this.buffer );
      gl.renderbufferStorage( gl.RENDERBUFFER,  getAttachmentFormat( gl, this.flags & 3 ) , this.fbo.width, this.fbo.height );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  null );
    }
  },


  dispose : function(){
    if( this.buffer ){
      if( this.flags & 4 ){
        this.buffer.dispose();
      }else{
        this.fbo.gl.deleteRenderbuffer( this.buffer );
      }
    }
    this._depthTexExt = null;
  },


  clearBits : function(){
    return ( ( this.flags & 1 ) ? 0x0100 : 0 ) |
           ( ( this.flags & 2 ) ? 0x0400 : 0 );
  }


};

//---------------------------------
//                        Utilities
//---------------------------------

// renderbuffer format
function getAttachmentFormat( gl, type ){
  switch( type ){
    case 1: return 0x81A5;  // DEPTH_COMPONENT16;
    case 2: return 0x8D48;  // STENCIL_INDEX8;
    case 3: return 0x84F9;  // DEPTH_STENCIL;
    default: throw new Error( 'unknown attachment type '+type );
  }
}

// depth texture format
function getTextureFormat( gl, type ){
  switch( type ){
    case 1: return 0x1902;  // DEPTH_COMPONENT;
    case 3: return 0x84F9;  // DEPTH_STENCIL;
    default: throw new Error( 'unknown texture type '+type );
  }
}

// depth texture internal format
function getTextureInternalFormat( gl, type ){
  switch( type ){
    case 1: return 0x1405;  // UNSIGNED_INT;
    case 3: return 0x84FA;  // UNSIGNED_INT_24_8_WEBGL (WEBGL_depth_texture extension)
    default: throw new Error( 'unknown texture type '+type );
  }
}


function getAttachmentType( gl, type ){
  switch( type ){
    case 1: return 0x8D00;  // DEPTH_ATTACHMENT
    case 2: return 0x8D20;  // STENCIL_ATTACHMENT;
    case 3: return 0x821A;  // DEPTH_STENCIL_ATTACHMENT;
    default: throw new Error( 'unknown attachment type '+type );
  }
}



var DEFAULT_OPTS = {};

module.exports = Fbo;
