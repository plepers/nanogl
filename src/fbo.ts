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

/**
 * This class manages framebuffer attachments.
 */
export class Attachment {
  /** The mipmap level of the target texture (must be `0`) */
  level: number;
  /** The target (texture or renderbuffer) of this attachment */
  readonly target: AttachmentTarget;
  /** Whether the attachment target is a texture or not */
  private _isTexture: boolean;

  /**
    * @param {AttachmentTarget} target  The texture or renderbuffer to attach
    */
  constructor(target: AttachmentTarget) {
    this.target = target;
    this.level = 0;

    this._isTexture = isTexture(target);
  }

  /**
    * Getter for the `_isTexture` property.
    * Know whether the attachment target is a texture or not.
    */
  isTexture() {
    return this._isTexture;
  }

  /**
   * Resize the attachment target.
   *  @param {number} w The new width
   *  @param {number} h The new height
   */
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

  /**
    * Attach the target to the FBO.
    * The FBO must be explicitely bound before calling this method.
    * @param {GLenum} bindingPoint  The binding point of the attachment (`GL_COLOR_ATTACHMENT0`, `GL_DEPTH_ATTACHMENT`, etc.)
    */
  _attach(bindingPoint: GLenum) {
    var gl = this.target.gl;
    if (this._isTexture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, this.target.id, this.level);
    } else {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, this.target.id);
    }
  }

  /**
    * Detach the target from the FBO.
    * The FBO must be explicitely bound before calling this method.
    * @param {GLenum} bindingPoint  The binding point of the attachment (`GL_COLOR_ATTACHMENT0`, `GL_DEPTH_ATTACHMENT`, etc.)
    */
  _detach(bindingPoint: GLenum) {
    var gl = this.target.gl;
    if (this._isTexture) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, null, this.level);
    } else {
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, null);
    }
  }

  /**
   * Delete all webgl objects related to this Attachment.
   */
  dispose() {
    this.target.dispose();
  }
}

/**
 * This class manages framebuffers and their attachments.
 */
class Fbo {
  /** The webgl context this FBO belongs to */
  readonly gl: GLContext;
  /** The underlying webgl framebuffer */
  readonly fbo: WebGLFramebuffer;

  /** The list of the attachments setup for this FBO */
  readonly attachmentsList: Attachment[];
  /** The list of the bindingPoint/attachment pairs setup for this FBO */
  attachments: Record<string,Attachment>;

  /** The width of this FBO */
  width: number;
  /** The height of this FBO */
  height: number;

  /**
    * @param {GLContext} gl  The webgl context this FBO belongs to
    */
  constructor( gl: GLContext ) {
    this.gl = gl;
    this.width = 0;
    this.height = 0;

    this.fbo = <WebGLFramebuffer>gl.createFramebuffer();
    this.bind();

    this.attachments = {};
    this.attachmentsList = [];
  }

  /**
    * Add an attachment to this FBO.
    * The FBO must be explicitely bound before calling this method.
    * @param {GLenum} bindingPoint  The binding point of the attachment (`GL_COLOR_ATTACHMENT0`, `GL_DEPTH_ATTACHMENT`, etc.)
    * @param {AttachmentTarget} res  The texture or buffer to attach
    */
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

  /**
    * Remove an attachment from this FBO.
    * The FBO must be explicitely bound before calling this method.
    * @param {GLenum} bindingPoint  The binding point of the attachment (`GL_COLOR_ATTACHMENT0`, `GL_DEPTH_ATTACHMENT`, etc.)
    */
  detach(bindingPoint: GLenum) {
    const att = this.attachments[bindingPoint.toString()];
    if (att !== undefined) {
      const index = this.attachmentsList.indexOf(att);
      this.attachmentsList.splice(index, 1);
      att._detach(bindingPoint);
    }
    delete this.attachments[bindingPoint.toString()];
  }

  /**
    * Get a specific attachment of this FBO (if it exists)
    * @param {GLenum} bindingPoint  The binding point of the attachment (`GL_COLOR_ATTACHMENT0`, `GL_DEPTH_ATTACHMENT`, etc.)
    */
  getAttachment(bindingPoint: GLenum): Attachment | null {
    const att = this.attachments[bindingPoint.toString()];
    if (att !== undefined) {
      return att;
    }
    return null;
  }

  /**
    * Get the color attachment of this FBO (if it exists)
    * @param {number} [index=0]  The color attachment index
    */
  getColor(index: number = 0): AttachmentTarget | null {
    const att = this.getAttachment(0x8ce0 + index); // COLOR_ATTACHMENT<index>
    return att ? att.target : null;
  }

  /**
    * Get the color texture of this FBO (if it exists)
    * @param {number} [index=0]  The color attachment index
    */
  getColorTexture(index: number = 0): Texture2D {
    const res = this.getColor( index );
    assertIsTexture( res, `Color attachment ${index} is not a texture.` );
    return res;
  }

  /**
    * Get the depth attachment of this FBO (if it exists)
    */
  getDepth(): AttachmentTarget | null {
    const att =
      this.getAttachment(0x8d00) || // DEPTH_ATTACHMENT
      this.getAttachment(0x8d20) || // STENCIL_ATTACHMENT;
      this.getAttachment(0x821a); // DEPTH_STENCIL_ATTACHMENT;
    return att ? att.target : null;
  }

  /**
    * Attach a texture to the color attachment 0 of this FBO.
    * The FBO must be explicitely bound before calling this method.
    * @param {GLenum} [format=GL_RGB]  The pixel format of the texture (`GL_RGB`, `GL_RGBA`, etc.)
    * @param {GLenum} [type=GL_UNSIGNED_BYTE]  The pixel data type of the texture (`GL_UNSIGNED_BYTE`, `GL_FLOAT`, etc.)
    * @param {GLenum} [internal=format]  The pixel internal format of the texture, defaults to the `format` parameter value
    */
  attachColor(format?: GLenum, type?: GLenum, internal?: GLenum) {
    const t = new Texture2D(this.gl, format, type, internal);
    return this.attach(0x8ce0, t);
  }

  /**
   *  Attach a renderbuffer/texture to the depth/stencil attachment of this FBO.
   *  The FBO must be explicitely bound before calling this method.
   *  @param {boolean} [depth=true] Add depth component or not
   *  @param {boolean} [stencil=false] Add stencil component or not
   *  @param {boolean} [useTexture=false] Use a Texture2D instead of a RenderBuffer. If true, the depth param must also be true. You also must ensure Depth Texture capability is available on your context.
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
   * Resize the FBO and its attachments.
   *  @param {number} w The new width
   *  @param {number} h The new height
   */
  resize(w: number, h: number) {
    if (this.width !== w || this.height !== h) {
      this.width = w | 0;
      this.height = h | 0;
      this._allocate();
    }
  }

  /**
   * Bind the underlying webgl framebuffer.
   */
  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  }

  /**
   * Clear all buffers (color, depth and stencil).
   */
  clear() {
    // COLOR | DEPTH | STENCIL
    this.gl.clear(0x4500);
  }

  /**
   *  Set the webgl viewport to the size of this FBO.
   */
  defaultViewport() {
    this.gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Check if the FBO is valid.
   * The FBO must be explicitely bound before calling this method.
   */
  isValid() {
    const gl = this.gl;
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  /**
   * Delete all webgl objects related to this FBO.
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

  /**
   *  Resize all attachments to the FBO size.
   */
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