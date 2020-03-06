import { GLContext } from './types';
export declare function isWebgl2(context: GLContext): context is WebGL2RenderingContext;
export declare function isBufferSource(val: GLsizeiptr | BufferSource): val is BufferSource;
export declare function getTextureFiltering(smooth: boolean, mipmap: boolean, miplinear: boolean): GLenum;
declare type ComponentSize = 1 | 2 | 4;
export declare function getComponentSize(type: GLenum): ComponentSize;
export {};
