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


function Fbo( gl, width, height, opts )
{
  this.gl = gl;
  this.width = 0;
  this.height = 0;
  this.fbo = null;

  opts = opts || DEFAULT_OPTS;

  this.flags = (opts.depth) | (opts.stencil*2);

  if( this.flags & 3 ){
    this.attachmentBuffer = gl.createRenderbuffer();
  } else {
    this.attachmentBuffer = null;
  }

  this.color = new Texture( gl, opts.format );
  this.resize( width, height );
}


Fbo.prototype = {


  resize : function( w, h ){

    if( this.width === w && this.height === h ) {
      return;
    }

    this.width = w;
    this.height = h;

    this._allocate();
    if( !this.fbo ){
      this._attach();
    }

  },


  bindColor : function( location, unit ){
    var gl = this.gl;
    gl.activeTexture( gl.TEXTURE0 + unit );
    gl.bindTexture( gl.TEXTURE_2D, this.color.id );
    gl.uniform1i( location, unit );
  },


  bind : function() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport( 0, 0, this.width, this.height );
  },


  clear : function() {
    var gl = this.gl;
    var bits = gl.COLOR_BUFFER_BIT;
    if( this.flags & 1 ) {
      bits |= gl.DEPTH_BUFFER_BIT;
    }
    if( this.flags & 2 ) {
      bits |= gl.STENCIL_BUFFER_BIT;
    }
    gl.clear( bits );
  },


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


  _attach : function() {
    var gl = this.gl;

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color.id, 0 );

    var attType = this.flags & 3;

    if( attType ) {
      var type   = getAttachmentType( gl, attType );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, type, gl.RENDERBUFFER, this.attachmentBuffer );
    }

    this.valid = true;
    if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE ){
      this.valid = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  },


  _allocate : function(){
    var gl = this.gl;

    this.color.fromData( this.width, this.height );

    var attType = this.flags & 3;
    if( attType ){
      var format = getAttachmentFormat( gl, attType );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  this.attachmentBuffer );
      gl.renderbufferStorage( gl.RENDERBUFFER,  format , this.width, this.height );
      gl.bindRenderbuffer(    gl.RENDERBUFFER,  null );
    }
  }

};

module.exports = Fbo;
