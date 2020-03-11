import { GLContext } from './types';
declare class RenderBuffer {
    readonly gl: GLContext;
    readonly id: WebGLRenderbuffer;
    readonly samples: number;
    readonly format: GLenum;
    width: number;
    height: number;
    readonly _uid: number;
    private _valid;
    constructor(gl: GLContext, format: GLenum, samples?: number);
    resize(w: number, h: number): void;
    allocate(): void;
    bind(): void;
    dispose(): void;
    _storage(): void;
}
export default RenderBuffer;
