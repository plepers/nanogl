var Texture = require( './texture' );


function Attachment( target ){

  this.target       = target;
  this.level        = 0;
  
  this.isTexture    = target.gl.isTexture( target.id );

}

Attachment.prototype = {


  resize : function( w, h ){

    if( this.isTexture ){
      this.target.fromData( w, h, null );
    } else {
      this.target.resize( w, h );
      this.target.allocate();
    }

  },


  attach : function(){
    var gl = this.target.gl;
    if( this.isTexture ){
      gl.framebufferTexture2D(    gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D,   this.target.id, this.level );
    } else {
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, this.target.id );
    }
  },


  dispose : function(){
    this.target.dispose();
    this.target = null;
  }

}




/**
 * @class
 * @param {WebGLRenderingContext} gl      the webgl context this Fbo belongs to
 * @param {Object} [opts]
 * @param {boolean} [opts.depth=false] if true, a depth renderbuffer is attached
 * @param {boolean} [opts.stencil=false] if true, a stencil renderbuffer is attached
 * @param {GLenum|GLenum[]} [opts.type=GL_UNSIGNED_BYTE] the pixel type of the Fbo, can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc. you can also provide an array of types used as cascaded fallbacks
 * @param {GLenum} [opts.format=GL_RGB]   the color attachment pixel format.
 * @param {GLenum} [opts.internal=GL_RGB] the internal color attachment pixel format.
 *
 */
function Fbo( gl )
{
  this.gl = gl;
  this.width  = 0;
  this.height = 0;

  this.fbo = gl.createFramebuffer();

  this.attachments     = {}
  this.attachmentsList = []
}


Fbo.prototype = {

  // /!\ FBO must be bound manualy
  attach : function( attachment, bindingPoint ){
    var gl = this.gl;

    this.detach( bindingPoint );

    this.attachments[bindingPoint.toString()] = attachment;
    this.attachmentsList.push( attachment );

    attachment.resize( this.width, this.height );
    attachment.attach();

  },


  detach : function( bindingPoint ){
    var att = this.attachments[bindingPoint.toString()];
    if( att !== undefined ){
      var index = this.attachmentsList.indexOf( att );
      this.attachmentsList.splice( index, 1 );
    }
  },



  attachColor : function( texture, unit ){
    unit = 0|unit;
    
  },


  addColor : function( config, unit ){
    unit = 0|unit;
    
  },


  attachDepth : function( texOrRbuff ){

  },


  addDepth : function( depth, stencil ){

  },


  addDepthTexture : function( texture ){

  },


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
   * Bind the Fbo and set gl viewport to it's size
   */
  bind : function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  },


  defaultViewport : function(){
    this.gl.viewport( 0, 0, this.width, this.height );
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
   * Delete all webgl objects related to this Fbo (fbo, and all attachments )
   */
  dispose : function(){
    var gl = this.gl;
    gl.deleteFramebuffer( this.fbo );
    
    for (var i = 0; i < this.attachmentsList.length; i++) {
      this.attachmentsList[i].dispose();
    }
    this.attachmentsList = null;
    this.attachments     = null;

    this.valid = false;
    this.fbo   = null;
    this.gl    = null;
  },



  // (re)allocate render buffers to size
  _allocate : function(){
    
    for (var i = 0; i < this.attachmentsList.length; i++) {
      this.attachmentsList[i].resize( this.width, this.height );
    }

  }


};



//---------------------------------
//         Depth/Stencil Attachment
//---------------------------------

function DepthStencilAttachment( fbo, flags ){
  this.fbo   = fbo;
  this.flags = flags;
  this.buffer = null;
}


DepthStencilAttachment.prototype = {

  _init : function(){
    var gl = this.fbo.gl;
    var attType = this.flags & 3;
    var depth = null;

    if( attType !== 0 ){
      depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  depth );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, getAttachmentType( gl, attType ), gl.RENDERBUFFER, depth );
    }

    this.buffer = depth;
  },


  _allocate : function(){
    var gl = this.fbo.gl;
    var attType = this.flags & 3;

    if( attType !== 0 ){
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  this.buffer );
      gl.renderbufferStorage( gl.RENDERBUFFER,  getAttachmentFormat( gl, attType ) , this.fbo.width, this.fbo.height );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  null );
    }
  },


  dispose : function(){
    if( this.buffer ){
      this.fbo.gl.deleteRenderbuffer( this.buffer );
    }
    this.buffer = null;
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
