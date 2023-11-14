/**
 * Know whether the value is a buffer source or not.
 * You can use it for values that can be either a size or a buffer source.
 * @param {GLsizeiptr|BufferSource} val The value to test
 */
export function isBufferSource(val: GLsizeiptr | BufferSource): val is BufferSource {
  return (<BufferSource>val).byteLength !== undefined;
}

/**
 * Compute texture filtering enum from parameters.
 * Will return one of the following : `NEAREST`, `LINEAR`, `NEAREST_MIPMAP_NEAREST`, `LINEAR_MIPMAP_NEAREST`, `NEAREST_MIPMAP_LINEAR`, `LINEAR_MIPMAP_LINEAR`.
 * @param {boolean} [smooth=false] Use linear filtering or not
 * @param {boolean} [mipmap=false] Enable mipmapping or not
 * @param {boolean} [miplinear=false] Use linear mipmapping or not
 */
export function getTextureFiltering(smooth: boolean, mipmap: boolean, miplinear: boolean) : GLenum {
  return 0x2600 | +smooth | (+mipmap << 8) | (+(mipmap && miplinear) << 1);
}

export type ComponentSize = 1|2|4

/**
 * Get the component size in bytes from a data type.
 * @param {GLenum} type The type of data (`GL_FLOAT`, `GL_SHORT`, etc.)
 */
export function getComponentSize(type: GLenum): ComponentSize {
  switch (type) {
    case 0x1400: //gl.BYTE:
    case 0x1401: //gl.UNSIGNED_BYTE:
      return 1;
    case 0x1402: //gl.SHORT:
    case 0x1403: //gl.UNSIGNED_SHORT:
      return 2;
    case 0x1404: //gl.INT:
    case 0x1405: //gl.UNSIGNED_INT:
    case 0x1406: //gl.FLOAT:
      return 4;
    default:
      throw new Error(`unknown type ${type}`)
  }
}
