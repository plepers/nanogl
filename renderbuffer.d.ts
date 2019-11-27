import { GLContext } from './types';
declare class RenderBuffer {
    gl: GLContext;
    id: WebGLRenderbuffer;
    width: number;
    height: number;
    format: GLenum;
    readonly _uid: number;
    private _valid;
    constructor(gl: GLContext, format: GLenum);
    resize(w: number, h: number): void;
    allocate(): void;
    bind(): void;
    dispose(): void;
    _storage(): void;
}
export = RenderBuffer;
