import Texture2D from './texture-2d'
import RenderBuffer from './renderbuffer'
import { GLContext, isWebgl2 } from './types';

function isTexture(target: AttachmentTarget): target is Texture2D {
  return target.id instanceof WebGLTexture;
}



function assertIsTexture(target: AttachmentTarget|null, msg:string): asserts target is Texture2D {
  if( target === null || !isTexture(target) ){
    throw new Error( msg );
  }
}


export type AttachmentTarget = Texture2D | RenderBuffer;

export class Attachment {

  level: number;
  readonly target: AttachmentTarget;
  private _isTexture: boolean;

  constructor(target: AttachmentTarget) {
    this.target = target;
    this.level = 0;

    this._isTexture = isTexture(target);
  }

  isTexture() {
    return this._isTexture;
  }

  _resize(w: number, h: number) {
    if (w > 0 && h > 0) {
      // const target :
      if (isTexture(this.target)) {
        this.target.fromData(w, h, null);
      } else {
        this.target.resize(w, h);
        this.target.allocate();
      }
    }
  }

  _attach(bindingPoint: GLenum) {
    var gl = this.target.gl;
    if (this._isTexture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, this.target.id, this.level);
    } else {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, this.target.id);
    }
  }

  _detach(bindingPoint: GLenum) {
    var gl = this.target.gl;
    if (this._isTexture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, null, this.level);
    } else {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, null);
    }
  }

  dispose() {
    this.target.dispose();
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
class Fbo {

  readonly gl: GLContext;
  readonly fbo: WebGLFramebuffer;

  readonly attachmentsList: Attachment[];
  attachments: Record<string,Attachment>;

  width: number;
  height: number;
  

  constructor( gl: GLContext ) {
    this.gl = gl;
    this.width = 0;
    this.height = 0;

    this.fbo = <WebGLFramebuffer>gl.createFramebuffer();
    this.bind();

    this.attachments = {};
    this.attachmentsList = [];
  }

  // The Fbo must be explicitely bound before calling this method
  attach(bindingPoint: GLenum, res: AttachmentTarget): Attachment {
    const attachment = new Attachment(res);
    bindingPoint = 0 | bindingPoint;

    this.detach(bindingPoint);

    this.attachments[bindingPoint.toString()] = attachment;
    this.attachmentsList.push(attachment);

    attachment._resize(this.width, this.height);
    attachment._attach(bindingPoint);
    return attachment;
  }

  // The Fbo must be explicitely bound before calling this method
  detach(bindingPoint: GLenum) {
    const att = this.attachments[bindingPoint.toString()];
    if (att !== undefined) {
      const index = this.attachmentsList.indexOf(att);
      this.attachmentsList.splice(index, 1);
      att._detach(bindingPoint);
    }
    delete this.attachments[bindingPoint.toString()];
  }

  
  getAttachment(bindingPoint: GLenum): Attachment | null {
    const att = this.attachments[bindingPoint.toString()];
    if (att !== undefined) {
      return att;
    }
    return null;
  }


  getColor(index: number = 0): AttachmentTarget | null {
    const att = this.getAttachment(0x8ce0 + index); // COLOR_ATTACHMENT<index>
    return att ? att.target : null;
  }


  getColorTexture(index: number = 0): Texture2D {
    const res = this.getColor( index );
    assertIsTexture( res, `Color attachment ${index} is not a texture.` );
    return res;
  }


  getDepth(): AttachmentTarget | null {
    const att =
      this.getAttachment(0x8d00) || // DEPTH_ATTACHMENT
      this.getAttachment(0x8d20) || // STENCIL_ATTACHMENT;
      this.getAttachment(0x821a); // DEPTH_STENCIL_ATTACHMENT;
    return att ? att.target : null;
  }

  /**
   * Shortcut to attach texture to color attachment 0
   */
  attachColor(format?: GLenum, type?: GLenum, internal?: GLenum) {
    const t = new Texture2D(this.gl, format, type, internal);
    return this.attach(0x8ce0, t);
  }

  /**
   * shortcut to attach depth/stencil renderbuffer/texture to this FBO
   *  @param {bool} [depth      =true ] add depth component to depth/stencil buffer
   *  @param {bool} [stencil    =false] add stencil components to depth/stencil buffer
   *  @param {bool} [useTexture =false] if true, use Texture instead of RenderBuffer, depth param must also be true. You must ensure Depth Texture capability is available on your context, no test are made here
   */
  attachDepth(depth: boolean = true, stencil: boolean = false, useTexture: boolean = false) {
    let attachment: AttachmentTarget;

    if (useTexture) {
      const cfg = dsTextureConfig(this.gl, stencil);
      attachment = new Texture2D(this.gl, cfg.format, cfg.type, cfg.internal);
    } else {
      attachment = new RenderBuffer(this.gl, dsRenderbufferStorage(depth, stencil));
    }

    return this.attach(dsAttachmentPoint(depth, stencil), attachment);
  }

  /**
   * Resize FBO attachments
   *  @param {uint} w new width
   *  @param {uint} h new height
   */
  resize(w: number, h: number) {
    if (this.width !== w || this.height !== h) {
      this.width = w | 0;
      this.height = h | 0;
      this._allocate();
    }
  }

  /**
   * Bind the Fbo ( simple shortcut for gl.bindFramebuffer(...) )
   */
  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  }

  /*
   * Clear all buffers
   */
  clear() {
    // COLOR | DEPTH | STENCIL
    this.gl.clear(0x4500);
  }

  defaultViewport() {
    this.gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Check if the Fbo is valid,
   * The Fbo must be explicitely bound before calling this method
   */
  isValid() {
    const gl = this.gl;
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  /**
   * Delete all webgl objects related to this Fbo (fbo, and all attachments )
   */
  dispose() {
    const gl = this.gl;
    gl.deleteFramebuffer(this.fbo);

    for (var i = 0; i < this.attachmentsList.length; i++) {
      this.attachmentsList[i].dispose();
    }

    this.attachmentsList.length = 0;
    this.attachments = {};

  }

  // (re)allocate render buffers to size
  _allocate() {
    for (var attachment of this.attachmentsList) {
      attachment._resize(this.width, this.height);
    }
  }
}

// ============================================
// DEPTH AND STENCIL ENUMS HELPERS
// ============================================

function dsFlag(depth: number, stencil: number) {
  return depth | (stencil << 1);
}

function dsAttachmentPoint(depth: any, stencil: any) {
  switch (dsFlag(depth, stencil)) {
    case 1:
      return 0x8d00; // DEPTH_ATTACHMENT
    case 2:
      return 0x8d20; // STENCIL_ATTACHMENT;
    case 3:
      return 0x821a; // DEPTH_STENCIL_ATTACHMENT;
    default:
      return 0;
  }
}

//
function dsRenderbufferStorage(depth: any, stencil: any) {
  switch (dsFlag(depth, stencil)) {
    case 1:
      return 0x81a5; // DEPTH_COMPONENT16;
    case 2:
      return 0x8d48; // STENCIL_INDEX8;
    case 3:
      return 0x84f9; // DEPTH_STENCIL;
    default:
      return 0;
  }
}

// depth texture internal format
// must return internal:undefined in webgl 1, so "internal" will match "format"
function dsTextureConfig(gl: GLContext, stencil: boolean) {
  if (stencil) {
    // DEPTH_STENCIL | DEPTH24_STENCIL8 | UNSIGNED_INT_24_8_WEBGL
    return { format: 0x84f9, type: 0x84fa, internal: isWebgl2(gl) ? gl.DEPTH24_STENCIL8 : gl.DEPTH_STENCIL };
  }
  // DEPTH_COMPONENT | DEPTH_COMPONENT24 | UNSIGNED_INT
  return { format: 0x1902, type: 0x1405, internal: isWebgl2(gl) ? gl.DEPTH_COMPONENT24 : gl.DEPTH_COMPONENT };
}


export default Fbo