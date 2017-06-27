
var Texture      = require( './texture'      ),
    RenderBuffer = require( './renderbuffer' );


function Attachment( target ){

  this.target       = target;
  this.level        = 0;
  
  this._isTexture    = (target.id instanceof WebGLTexture);

}

Attachment.prototype = {


  isTexture : function(){
    return this._isTexture;
  },


  _resize : function( w, h ){
    if( w > 0 && h > 0 ){
      if( this._isTexture ){
        this.target.fromData( w, h, null );
      } else {
        this.target.resize( w, h );
        this.target.allocate();
      }
    }

  },


  _attach : function( bindingPoint ){
    var gl = this.target.gl;
    if( this._isTexture ){
      gl.framebufferTexture2D(    gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D,   this.target.id, this.level );
    } else {
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, this.target.id );
    }
  },


  _detach : function( bindingPoint ){
    var gl = this.target.gl;
    if( this._isTexture ){
      gl.framebufferTexture2D(    gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D,   null, this.level );
    } else {
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, null );
    }
  },


  dispose : function(){
    this.target.dispose();
    this.target = null;
  }

};



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
  this.bind();

  this.attachments     = {};
  this.attachmentsList = [];
}



Fbo.prototype = {

  

  // The Fbo must be explicitely bound before calling this method
  attach : function( bindingPoint, res ){
    var attachment = new Attachment( res );
    bindingPoint = 0|bindingPoint;

    this.detach( bindingPoint );

    this.attachments[bindingPoint.toString()] = attachment;
    this.attachmentsList.push( attachment );

    attachment._resize( this.width, this.height );
    attachment._attach( bindingPoint );
    return attachment;
  },


  // The Fbo must be explicitely bound before calling this method
  detach : function( bindingPoint ){
    var att = this.attachments[bindingPoint.toString()];
    if( att !== undefined ){
      var index = this.attachmentsList.indexOf( att );
      this.attachmentsList.splice( index, 1 );
      att._detach( bindingPoint );
    }
    delete this.attachments[bindingPoint.toString()];
  },


  getAttachment : function( bindingPoint ){
    var att = this.attachments[bindingPoint.toString()];
    if( att !== undefined ){
      return att;
    }
    return null;
  },


  getColor : function(index){
    index = index|0; 
    var att = this.getAttachment( 0x8CE0 + index ); // COLOR_ATTACHMENT<index>
    return att ? att.target : null;
  },


  getDepth : function(){ 
    var att = this.getAttachment( 0x8D00 )|| // DEPTH_ATTACHMENT
              this.getAttachment( 0x8D20 )|| // STENCIL_ATTACHMENT;
              this.getAttachment( 0x821A );  // DEPTH_STENCIL_ATTACHMENT;
    return att ? att.target : null;
  },

  /**
  * Shortcut to attach texture to color attachment 0
  */
  attachColor : function( format, type, internal ){
    var t = new Texture( this.gl, format, type, internal );
    return this.attach( 0x8CE0, t );
  },

  /**
   * shortcut to attach depth/stencil renderbuffer/texture to this FBO
   *  @param {bool} [depth      =true ] add depth component to depth/stencil buffer
   *  @param {bool} [stencil    =false] add stencil components to depth/stencil buffer
   *  @param {bool} [useTexture =false] if true, use Texture instead of RenderBuffer, depth param must also be true. You must ensure Depth Texture capability is available on your context, no test are made here
   */
  attachDepth : function( depth, stencil, useTexture ){
    depth      = (depth !== undefined ) ? !!depth : true;
    stencil    = !!stencil;
    useTexture = !!useTexture && depth;

    var attachment;

    if( useTexture ){
      var cfg = dsTextureConfig( this.gl, stencil );
      attachment  = new Texture( this.gl, cfg.format, cfg.type, cfg.internal );
    } else {
      attachment  = new RenderBuffer( this.gl, dsRenderbufferStorage( depth, stencil ) );
    }

    return this.attach( dsAttachmentPoint( depth, stencil ), attachment );

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
   * Bind the Fbo ( simple shortcut for gl.bindFramebuffer(...) )
   */
  bind : function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  },

  /*
   * Clear all buffers
   */
  clear : function(){
    // COLOR | DEPTH | STENCIL
    this.gl.clear( 0x4500 );
  },


  defaultViewport : function(){
    this.gl.viewport( 0, 0, this.width, this.height );
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
      this.attachmentsList[i]._resize( this.width, this.height );
    }

  }


};


// ============================================
// DEPTH AND STENCIL ENUMS HELPERS
// ============================================

function dsFlag( depth, stencil ){
  return  depth | ( stencil <<1 );
}

function dsAttachmentPoint( depth, stencil ){
  switch( dsFlag( depth, stencil ) ){
    case 1: return 0x8D00;  // DEPTH_ATTACHMENT
    case 2: return 0x8D20;  // STENCIL_ATTACHMENT;
    case 3: return 0x821A;  // DEPTH_STENCIL_ATTACHMENT;
    default : return 0;
  }
}



// 
function dsRenderbufferStorage( depth, stencil ){
  switch( dsFlag( depth, stencil ) ){
    case 1: return 0x81A5;  // DEPTH_COMPONENT16;
    case 2: return 0x8D48;  // STENCIL_INDEX8;
    case 3: return 0x84F9;  // DEPTH_STENCIL;
    default : return 0;
  }
}


// depth texture internal format
// must return internal:undefined in webgl 1, so "internal" will match "format"
function dsTextureConfig( gl , stencil ){
  if( stencil ){
    // DEPTH_STENCIL | DEPTH24_STENCIL8 | UNSIGNED_INT_24_8_WEBGL
    return {format: 0x84F9, type : 0x84FA, internal : gl.DEPTH24_STENCIL8 };
  } 
  // DEPTH_COMPONENT | DEPTH_COMPONENT24 | UNSIGNED_INT
  return {format: 0x1902, type : 0x1405, internal : gl.DEPTH_COMPONENT24 };
}





module.exports = Fbo;
