import Texture2D from './texture-2d';
import RenderBuffer from './renderbuffer';
import { isWebgl2 } from './utils';
function isTexture(target) {
    return target.id instanceof WebGLTexture;
}
function assertIsTexture(target, msg) {
    if (target === null || !isTexture(target)) {
        throw new Error(msg);
    }
}
export class Attachment {
    constructor(target) {
        this.target = target;
        this.level = 0;
        this._isTexture = isTexture(target);
    }
    isTexture() {
        return this._isTexture;
    }
    _resize(w, h) {
        if (w > 0 && h > 0) {
            if (isTexture(this.target)) {
                this.target.fromData(w, h, null);
            }
            else {
                this.target.resize(w, h);
                this.target.allocate();
            }
        }
    }
    _attach(bindingPoint) {
        var gl = this.target.gl;
        if (this._isTexture) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, this.target.id, this.level);
        }
        else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, this.target.id);
        }
    }
    _detach(bindingPoint) {
        var gl = this.target.gl;
        if (this._isTexture) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, bindingPoint, gl.TEXTURE_2D, null, this.level);
        }
        else {
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, bindingPoint, gl.RENDERBUFFER, null);
        }
    }
    dispose() {
        this.target.dispose();
    }
}
class Fbo {
    constructor(gl) {
        this.gl = gl;
        this.width = 0;
        this.height = 0;
        this.fbo = gl.createFramebuffer();
        this.bind();
        this.attachments = {};
        this.attachmentsList = [];
    }
    attach(bindingPoint, res) {
        const attachment = new Attachment(res);
        bindingPoint = 0 | bindingPoint;
        this.detach(bindingPoint);
        this.attachments[bindingPoint.toString()] = attachment;
        this.attachmentsList.push(attachment);
        attachment._resize(this.width, this.height);
        attachment._attach(bindingPoint);
        return attachment;
    }
    detach(bindingPoint) {
        const att = this.attachments[bindingPoint.toString()];
        if (att !== undefined) {
            const index = this.attachmentsList.indexOf(att);
            this.attachmentsList.splice(index, 1);
            att._detach(bindingPoint);
        }
        delete this.attachments[bindingPoint.toString()];
    }
    getAttachment(bindingPoint) {
        const att = this.attachments[bindingPoint.toString()];
        if (att !== undefined) {
            return att;
        }
        return null;
    }
    getColor(index = 0) {
        const att = this.getAttachment(0x8ce0 + index);
        return att ? att.target : null;
    }
    getColorTexture(index = 0) {
        const res = this.getColor(index);
        assertIsTexture(res, "Color attachment {index} is not a texture.");
        return res;
    }
    getDepth() {
        const att = this.getAttachment(0x8d00) ||
            this.getAttachment(0x8d20) ||
            this.getAttachment(0x821a);
        return att ? att.target : null;
    }
    attachColor(format, type, internal) {
        const t = new Texture2D(this.gl, format, type, internal);
        return this.attach(0x8ce0, t);
    }
    attachDepth(depth = true, stencil = false, useTexture = false) {
        let attachment;
        if (useTexture) {
            const cfg = dsTextureConfig(this.gl, stencil);
            attachment = new Texture2D(this.gl, cfg.format, cfg.type, cfg.internal);
        }
        else {
            attachment = new RenderBuffer(this.gl, dsRenderbufferStorage(depth, stencil));
        }
        return this.attach(dsAttachmentPoint(depth, stencil), attachment);
    }
    resize(w, h) {
        if (this.width !== w || this.height !== h) {
            this.width = w | 0;
            this.height = h | 0;
            this._allocate();
        }
    }
    bind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    }
    clear() {
        this.gl.clear(0x4500);
    }
    defaultViewport() {
        this.gl.viewport(0, 0, this.width, this.height);
    }
    isValid() {
        const gl = this.gl;
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }
    dispose() {
        const gl = this.gl;
        gl.deleteFramebuffer(this.fbo);
        for (var i = 0; i < this.attachmentsList.length; i++) {
            this.attachmentsList[i].dispose();
        }
        this.attachmentsList.length = 0;
        this.attachments = {};
    }
    _allocate() {
        for (var attachment of this.attachmentsList) {
            attachment._resize(this.width, this.height);
        }
    }
}
function dsFlag(depth, stencil) {
    return depth | (stencil << 1);
}
function dsAttachmentPoint(depth, stencil) {
    switch (dsFlag(depth, stencil)) {
        case 1:
            return 0x8d00;
        case 2:
            return 0x8d20;
        case 3:
            return 0x821a;
        default:
            return 0;
    }
}
function dsRenderbufferStorage(depth, stencil) {
    switch (dsFlag(depth, stencil)) {
        case 1:
            return 0x81a5;
        case 2:
            return 0x8d48;
        case 3:
            return 0x84f9;
        default:
            return 0;
    }
}
function dsTextureConfig(gl, stencil) {
    if (stencil) {
        return { format: 0x84f9, type: 0x84fa, internal: isWebgl2(gl) ? gl.DEPTH24_STENCIL8 : gl.DEPTH_STENCIL };
    }
    return { format: 0x1902, type: 0x1405, internal: isWebgl2(gl) ? gl.DEPTH_COMPONENT24 : gl.DEPTH_COMPONENT };
}
export default Fbo;
