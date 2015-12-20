
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


function Fbo( gl, width, height, opts ){
  this.gl = gl;
  this.width = 0;
  this.height = 0;

  this.color = null;
  this.fbo = null;
  this.attachmentBuffer = null;

  opts = opts || {};

  this.filter = gl.LINEAR;
  this.flags = (opts.depth) | (opts.stencil*2);

  this.resize( width, height );
}


Fbo.prototype = {

  resize : function( w, h ){

    if( this.width === w && this.height === h ) {
      return;
    }

    this.width = w;
    this.height = h;

    if( this.color ){
      this._realloc();
    } else {
      this._alloc();
    }

  },

  bindColor : function( location, unit ){
    var gl = this.gl;
    gl.activeTexture( gl.TEXTURE0 + unit );
    gl.bindTexture( gl.TEXTURE_2D, this.color );
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
    gl.deleteTexture( this.color );
    this.valid = false;
    this.gl = null;
  },


  _alloc : function() {

    var gl = this.gl;

    this.color = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, this.color );

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null );

    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.filter );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.filter );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );


    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, this.fbo );
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.color, 0 );

    var attType = this.flags & 3;
    if( attType ) {
      var format = getAttachmentFormat( gl, attType ),
          type   = getAttachmentType( gl, attType );

      this.attachmentBuffer = gl.createRenderbuffer();

      gl.bindRenderbuffer(        gl.RENDERBUFFER,  this.attachmentBuffer );
      gl.renderbufferStorage(     gl.RENDERBUFFER,  format , this.width, this.height );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER,   type, gl.RENDERBUFFER, this.attachmentBuffer );
    }


    this.valid = true;
    if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE ){
      this.valid = false;
    }

    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.bindTexture( gl.TEXTURE_2D, null );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  },


  _realloc : function(){
    var gl = this.gl;

    gl.bindTexture( gl.TEXTURE_2D, this.color );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
    gl.bindTexture( gl.TEXTURE_2D, null );

    var attType = this.flags & 3;
    if( attType ){

      var format = getAttachmentFormat( gl, attType ),
          type   = getAttachmentType( gl, attType );

      gl.bindRenderbuffer(        gl.RENDERBUFFER,  this.attachmentBuffer );
      gl.renderbufferStorage(     gl.RENDERBUFFER,  format , this.width, this.height );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER,   type, gl.RENDERBUFFER, this.attachmentBuffer );
    }
  }

};

module.exports = Fbo;
