
export function isBufferSource(val: GLsizeiptr | BufferSource): val is BufferSource {
  return (<BufferSource>val).byteLength !== undefined;
}

/*
 * compute filtering enum, return one of the following :
 *  NEAREST
 *  LINEAR
 *  NEAREST_MIPMAP_NEAREST
 *  LINEAR_MIPMAP_NEAREST
 *  NEAREST_MIPMAP_LINEAR
 *  LINEAR_MIPMAP_LINEAR
 */
export function getTextureFiltering(smooth: boolean, mipmap: boolean, miplinear: boolean) : GLenum {
  return 0x2600 | +smooth | (+mipmap << 8) | (+(mipmap && miplinear) << 1);
}

type ComponentSize = 1|2|4

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
