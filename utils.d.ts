export declare function isBufferSource(val: GLsizeiptr | BufferSource): val is BufferSource;
export declare function getTextureFiltering(smooth: boolean, mipmap: boolean, miplinear: boolean): GLenum;
type ComponentSize = 1 | 2 | 4;
export declare function getComponentSize(type: GLenum): ComponentSize;
export {};
