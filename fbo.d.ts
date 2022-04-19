import Texture2D from './texture-2d';
import RenderBuffer from './renderbuffer';
import { GLContext } from './types';
export declare type AttachmentTarget = Texture2D | RenderBuffer;
export declare class Attachment {
    readonly target: AttachmentTarget;
    level: number;
    private _isTexture;
    constructor(target: AttachmentTarget);
    isTexture(): boolean;
    _allocate(w: number, h: number): void;
    _attach(bindingPoint: GLenum): void;
    _detach(bindingPoint: GLenum): void;
    dispose(): void;
}
declare class Fbo {
    readonly gl: GLContext;
    readonly fbo: WebGLFramebuffer;
    readonly attachmentsList: Attachment[];
    attachments: Record<string, Attachment>;
    width: number;
    height: number;
    constructor(gl: GLContext);
    attach(bindingPoint: GLenum, res: AttachmentTarget): Attachment;
    detach(bindingPoint: GLenum): void;
    getAttachment(bindingPoint: GLenum): Attachment | null;
    getColor(index?: number): AttachmentTarget | null;
    getColorTexture(index?: number): Texture2D;
    getDepth(): AttachmentTarget | null;
    attachColor(format?: GLenum, type?: GLenum, internal?: GLenum): Attachment;
    attachDepth(depth?: boolean, stencil?: boolean, useTexture?: boolean): Attachment;
    setSize(w: number, h: number): void;
    resize(w: number, h: number): void;
    bind(): void;
    clear(): void;
    defaultViewport(): void;
    isValid(): boolean;
    dispose(): void;
    private _allocate;
}
export default Fbo;
