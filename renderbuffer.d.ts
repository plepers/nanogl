import { GLContext } from './types';
declare class RenderBuffer {
    readonly gl: GLContext;
    readonly format: GLenum;
    readonly _uid: number;
    readonly id: WebGLRenderbuffer;
    private _maxSamples;
    private _samples;
    width: number;
    height: number;
    constructor(gl: GLContext, format?: GLenum, msaaSamples?: number);
    multisampling(samples: number): void;
    allocate(width: number, height: number): void;
    bind(): void;
    dispose(): void;
    private _storage;
}
export default RenderBuffer;
