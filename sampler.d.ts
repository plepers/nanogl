declare class Sampler {
    readonly _uid: number;
    gl: WebGL2RenderingContext;
    id: WebGLSampler;
    constructor(gl: WebGL2RenderingContext);
    bind(unit: number): void;
    dispose(): void;
    setFilter(smooth?: boolean, mipmap?: boolean, miplinear?: boolean): void;
    repeat(): void;
    clamp(): void;
    mirror(): void;
    wrap(wrap: GLenum): void;
}
export = Sampler;
