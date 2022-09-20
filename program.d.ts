import { GLContext } from './types';
declare class Program {
    static debug: boolean;
    readonly gl: GLContext;
    readonly program: WebGLProgram;
    readonly vShader: WebGLShader;
    readonly fShader: WebGLShader;
    protected dyns: string[];
    ready: boolean;
    _uid: number;
    _cuid: number;
    [k: string]: any;
    constructor(gl: GLContext, vert?: string, frag?: string, defs?: string);
    use(): void;
    bind(): void;
    compile(vert: string, frag: string, prefix?: string): boolean;
    dispose(): void;
    _grabParameters(): void;
}
export default Program;
