import Texture = require('./texture');
import RenderBuffer = require('./renderbuffer');
import { GLContext } from './types';
declare type AttachmentTarget = Texture | RenderBuffer;
declare class Attachment {
    level: number;
    target: AttachmentTarget;
    _isTexture: boolean;
    constructor(target: AttachmentTarget);
    isTexture(): boolean;
    _resize(w: number, h: number): void;
    _attach(bindingPoint: GLenum): void;
    _detach(bindingPoint: GLenum): void;
    dispose(): void;
}
declare class Fbo {
    gl: GLContext;
    fbo: WebGLFramebuffer;
    width: number;
    height: number;
    attachmentsList: Attachment[];
    attachments: Record<string, Attachment>;
    constructor(gl: GLContext);
    attach(bindingPoint: GLenum, res: AttachmentTarget): Attachment;
    detach(bindingPoint: GLenum): void;
    getAttachment(bindingPoint: GLenum): Attachment | null;
    getColor(index: number): AttachmentTarget | null;
    getDepth(): AttachmentTarget | null;
    attachColor(format?: GLenum, type?: GLenum, internal?: GLenum): Attachment;
    attachDepth(depth?: boolean, stencil?: boolean, useTexture?: boolean): Attachment;
    resize(w: number, h: number): void;
    bind(): void;
    clear(): void;
    defaultViewport(): void;
    isValid(): boolean;
    dispose(): void;
    _allocate(): void;
}
export = Fbo;
