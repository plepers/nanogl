type uint = number
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array

declare module "nanogl" {

  interface Attrib {
    name: string,
    type: GLenum,
    size: uint,
    normalize: boolean,
    offset: uint
  }

  class DepthStencilAttachment {
    fbo: Fbo
    flags: uint
    buffer: WebGLBuffer

    protected _init(): void
    protected _allocate(): void
    dispose(): void
    clearBits(): void
  }

  export interface Drawable {
    drawPoints(count: uint, offset: uint): void
    drawLines(count: uint, offset: uint): void
    drawLineLoop(count: uint, offset: uint): void
    drawLineStrip(count: uint, offset: uint): void
    drawTriangles(count: uint, offset: uint): void
    drawTriangleStrip(count: uint, offset: uint): void
    drawTriangleFan(count: uint, offset: uint): void
  }

  export class ArrayBuffer implements Drawable {
    gl: WebGLRenderingContext
    usage: GLenum
    buffer: WebGLBuffer
    attribs: Attrib[]
    stride: uint
    byteLength: uint
    length: number
    valid: boolean

    /**
     * @class
     * @implements {Drawable}
     * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
     * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
     * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
     *
     */
    constructor(gl: WebGLRenderingContext, data: TypedArray|uint, usage?: GLenum)

    /**
     * Bind the underlying webgl buffer.
     */
    bind(): void

    /**
     * Add attribute declaration for this buffer. Once attributes declared, the buffer can be linked to
     * programs attributes using {@link ArrayBuffer#attribPointer}
     *  @param {string} name the name of the program's attribute
     *  @param {uint} size the size of the attribute (3 for a vec3)
     *  @param {GLenum} type the type of data (GL_FLOAT, GL_SHORT etc)
     *  @param {boolean} [normalize=false] indicate if the data must be normalized
     */
    attrib(): ArrayBuffer

    /**
     * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
     *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
     */
    data(array: TypedArray|uint) : void

    /**
     * Set a part of the buffer with the given data, starting a offset (in bytes)
     *  @param {typedArray} array the data to send to buffer
     *  @param {uint} offset the offset in byte where the data will be written
     */
    subData(array: TypedArray|uint, offset: uint) : void

    /**
     * Link given program attributes to this buffer. You should first declare attributes using {@link ArrayBuffer#attrib}
     * before calling this method.
     *   @param {Program} program the nanogl Program
     */
    attribPointer(program: Program) : void

    /**
     * Shortcut to gl.drawArrays
     *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
     *   @param {uint} [count] the number of vertices to draw (full buffer is used if omited)
     *   @param {uint} [offset=0] the position of the first vertex to draw
     */
    draw(mode: GLenum, count: uint, offset: uint): void

    /**
     * Delete underlying webgl objects
     */
    dispose(): void

    private _computeLength(): void

    drawPoints(count: uint, offset: uint): void
    drawLines(count: uint, offset: uint): void
    drawLineLoop(count: uint, offset: uint): void
    drawLineStrip(count: uint, offset: uint): void
    drawTriangles(count: uint, offset: uint): void
    drawTriangleStrip(count: uint, offset: uint): void
    drawTriangleFan(count: uint, offset: uint): void
  }

  export class IndexBuffer implements Drawable {
    gl: WebGLRenderbuffer
    buffer: WebGLBuffer
    usage: GLenum
    type: GLenum
    typeSize: number
    size: number

    /**
     * @class
     * @implements {Drawable}
     * @param {WebGLRenderingContext} gl      then webgl context this ArrayBuffer belongs to
     * @param {GLenum} [type=GL_UNSIGNED_SHORT]  the inetger type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
     * @param {TypedArray|uint} [data]   optional data to copy to buffer, or the size (in bytes)
     * @param {GLenum} [usage=GL_STATIC_DRAW] the usage hint for this buffer.
     *
     */
    constructor(gl: WebGLRenderingContext, type: GLenum, data: TypedArray|uint, usage?: GLenum)

    /**
     * Bind the underlying webgl buffer.
     */
    bind(): void

    /**
     *  Change the type of internal type of the IndexBuffer
     *  @param {GLenum} type  the integer type of the indices (GL_UNSIGNED_BYTE, GL_UNSIGNED_INT etc)
     */
    setType(type: GLenum): void

    /**
     * Fill webgl buffer with the given data. You can also pass a uint  to allocate the buffer to the given size.
     *   @param {TypedArray|uint} array the data to send to the buffer, or a size.
     */
    data(array: TypedArray|uint) : void

    /**
     * Set a part of the buffer with the given data, starting a offset (in bytes)
     *  @param {typedArray} array the data to send to buffer
     *  @param {uint} offset the offset in byte where the data will be written
     */
    subData(array: TypedArray|uint, offset: uint) : void

    /**
     * Delete underlying webgl objects
     */
    dispose(): void

    /**
     * Shortcut to gl.drawArrays
     *   @param {GLenum} mode the type of primitive to draw (GL_TRIANGLE, GL_POINTS etc)
     *   @param {uint} [count] the number of indices to draw (full buffer is used if omited)
     *   @param {uint} [offset=0] the position of the first index to draw
     */
    draw(mode: GLenum, count: uint, offset: uint): void

    drawPoints(count: uint, offset: uint): void
    drawLines(count: uint, offset: uint): void
    drawLineLoop(count: uint, offset: uint): void
    drawLineStrip(count: uint, offset: uint): void
    drawTriangles(count: uint, offset: uint): void
    drawTriangleStrip(count: uint, offset: uint): void
    drawTriangleFan(count: uint, offset: uint): void
  }

  export class Fbo {
    gl: WebGLRenderingContext
    width: number
    height: number
    fbo: WebGLFramebuffer
    types: GLenum[]
    color: WebGLTexture
    attachment: DepthStencilAttachment

    /**
     * @class
     * @param {WebGLRenderingContext} gl      the webgl context this Fbo belongs to
     * @param {Object} [opts]
     * @param {boolean} [opts.depth=false] if true, a depth renderbuffer is attached
     * @param {boolean} [opts.stencil=false] if true, a stencil renderbuffer is attached
     * @param {GLenum|GLenum[]} [opts.type=GL_UNSIGNED_BYTE] the pixel type of the Fbo, can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc. you can also provide an array of types used as cascaded fallbacks
     * @param {GLenum} [opts.format=GL_RGB] the internal pixel format.
     *
     */
    constructor(gl: WebGLRenderingContext, opts?: { depth?: boolean, stencil?: boolean, type?: GLenum | GLenum[], format?: GLenum })

    /**
     * Resize FBO attachments
     *  @param {uint} w new width
     *  @param {uint} h new height
     */
    resize(w: uint, h: uint): void

    /**
     * Bind the color texture of this Fbo to a sampler2D location and a unit
     * The related program must be in use.
     * @param {WebGLUniformLocation} location the program's sampler to bind the textue to
     * @param {} unit the texture unit to use
     */
    bindColor(location: WebGLUniformLocation, unit: uint): void

    /**
     * Bind the Fbo and set gl viewport to it's size
     */
    bind(): void

    /**
     * Clear all buffer of the Fbo.
     * The Fbo must be explicitly bound before calling this method
     */
    clear(): void

    /**
     * Check if the Fbo is valid,
     * The Fbo must be explicitely bound before calling this method
     */
    isValid(): void

    /**
     * return the actual pixel type of the underlying color texture (UNSIGNED_BYTE, FLOAT, HALF_FLOAT_EOS etc)
     * after possibles types has been tested
     */
    getActualType(): void

    /**
     * Delete all webgl objects related to this Fbo (fbo, color attachment and depth/stencil renderbuffer )
     */
    dispose(): void

    // create render buffers and set attchment points
    protected _init(): void

    // (re)allocate render buffers to size
    protected _allocate(): void
  }

  export class Program {
    gl: WebGLRenderingContext
    program: WebGLProgram
    vShader: WebGLShader
    fShader: WebGLShader
    dyns: string[]
    ready: boolean
    _uid: uint
    _cuid: uint

    /**
     * Program.debug
     *   can be set to true to check and log compilation and linking errors (default to false)
     */
    static debug:boolean

    /**
     * Program constructor. Create gl program and shaders. You can pass optional shader code to immediatly compile shaders
     *   @param {WebGLRenderingContext} gl webgl context this program belongs to
     *   @param {String} [vert=undefined] an optional vertex shader code. See {@link Program#compile}
     *   @param {String} [frag=undefined] an optional fragment shader code See {@link Program#compile}
     *   @param {String} [defs=undefined] an optional string prepend to both fragment and vertex shader code. See {@link Program#compile}.
     *   @see {@link Program#compile}
     *
     * @example <caption>For the given vertex shader</caption>
     * attribute vec3 aPosition;
     * uniform mat4 uMVP;
     * uniform vec3 uCameraPosition;
     *
     * @class
     * @classdesc Program class provide shader compilation and linking functionality.
     *              It also give you convenient access to active uniforms and attributes.
     *              Once compiled, the Program object list all used uniforms/attributes and provide getter/setter function for each one. See {@link Program} constructor.
     *
     */
    constructor(gl: WebGLRenderingContext, vert: string, frag: string, defs: string)

    /**
     * Shortcut for gl.useProgram()
     * alias program.bind()
     */
    use(): void

    /**
     * Compile vertex and fragment shader then link gl program
     * This method can be safely called several times.
     *  @param {String} vert vertex shader code
     *  @param {String} frag fragment shader code
     *  @param {String} [prefix=''] an optional string append to both fragment and vertex code
     */
    compile(vert: string, frag: string, prefix?: string): boolean

    /**
     * Delete program and shaders
     */
    dispose(): void

    /*
      *  List all uniforms and attributes and create helper function on Program instance
      *  eg :
      *     for a uniform vec3 uDirection;
      *     create a method
      *        program.uDirection( 1, 0, 0 );
      */
    _grabParameters(): void

    /**
     * alias to Program.use()
     */
    bind(): void
  }

  export class Texture {
    gl: WebGLRenderingContext
    _uid: uint
    id: WebGLTexture
    width: 0
    height: 0
    format: GLenum
    type: GLenum

    /**
     * @class
     * @classdesc Texture class manage TEXTURE_2D types textures
     *
     *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
     *  @param {GLenum} [format=GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
     */
    constructor(gl: WebGLRenderingContext, format?: GLenum)

    /**
     * set texture data from html source
     *   @param {TexImageSource} img the source. Can be ImageBitmap, ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement
     */
    fromImage(img: HTMLImageElement): void

    /**
     * Allocate texture to the given size, with optional data (TypedArray) and data type
     *  @param {number} width     the new texture's width
     *  @param {number} height    the new texture's height
     *  @param {TypedArray} [data=null]  TypedArray of texture data, can be null
     *  @param {GLenum} [dataType=GL_UNSIGNED_BYTE] can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc depending on available extensions
     */
    fromData(width: number, height: number, data?: TypedArray, dataType?: GLenum)

    /**
     * Bind the texture
     *   @param {uint} [unit=undefined] optional texture unit to make active before binding
     */
    bind(unit: uint): void

    /**
     * delete the webgl texture
     *
     */
    dispose(): void

    /**
     * Change the filtering parameters
     *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
     *   @param {boolean} [mipmap=false]    if true, enable mipmaping
     *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
     */
    setFilter(smooth: boolean, mipmap: boolean, miplinear: boolean): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.REPEAT
     */
    repeat(): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.CLAMP_TO_EDGE
     */
    clamp(): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.MIRRORED_REPEAT
     */
    mirror(): void

    /**
     * Set both WRAP_S and WRAP_T property to the given value
     *  @param {GLenum} wrap the wrap enum
     */
    wrap(wrap: GLenum): void
  }

  export class TextureCube {
    gl: WebGLRenderingContext
    _uid: uint
    id: WebGLTexture
    width: 0
    height: 0
    format: GLenum
    type: GLenum

    /**
     * @class
     * @classdesc Texture class manage TEXTURE_2D types textures
     *
     *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
     *  @param {GLenum} [format=GL_RGB] the pixel format, default to gl.RGB (can be gl.RGB, gl.RGBA, gl.LUMINANCE...)
     */
    constructor(gl: WebGLRenderingContext, format?: GLenum)

    /**
     * set texture data from html source
     *   @param {TexImageSource} img the source. Can be ImageBitmap, ImageData, HTMLImageElement, HTMLCanvasElement, HTMLVideoElement
     */
    fromImage(img: HTMLImageElement): void

    /**
     * Allocate texture to the given size, with optional data (TypedArray) and data type
     *  @param {number} width     the new texture's width
     *  @param {number} height    the new texture's height
     *  @param {TypedArray} [data=null]  TypedArray of texture data, can be null
     *  @param {GLenum} [dataType=GL_UNSIGNED_BYTE] can be gl.UNSIGNED_BYTE, gl.FLOAT, half.HALF_FLOAT_OES etc depending on available extensions
     */
    fromData(width: number, height: number, data?: TypedArray, dataType?: GLenum)

    /**
     * Bind the texture
     *   @param {uint} [unit=undefined] optional texture unit to make active before binding
     */
    bind(unit: uint): void

    /**
     * delete the webgl texture
     *
     */
    dispose(): void

    /**
     * Change the filtering parameters
     *   @param {boolean} [smooth=false]    if true, use LINEAR filtering
     *   @param {boolean} [mipmap=false]    if true, enable mipmaping
     *   @param {boolean} [miplinear=false] if true, use linear Mipmapping
     */
    setFilter(smooth: boolean, mipmap: boolean, miplinear: boolean): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.REPEAT
     */
    repeat(): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.CLAMP_TO_EDGE
     */
    clamp(): void

    /**
     * Set both WRAP_S and WRAP_T property to gl.MIRRORED_REPEAT
     */
    mirror(): void

    /**
     * Set both WRAP_S and WRAP_T property to the given value
     *  @param {GLenum} wrap the wrap enum
     */
    wrap(wrap: GLenum): void
  }

}

declare module "nanogl/bufferutils" {
  export function getComponentSize(): GLenum
  export function Drawable(proto: object): void
}