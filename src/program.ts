import { GLContext, isWebgl2 } from './types';

interface CompilationContext {
  texIndex: number;
  ublockIndex: number;
}


let _UID: number = 0;

/**
 * This class provides provides shader compilation and webgl program linking functionality.
 * It also give you convenient access to active uniforms and attributes.
 */
class Program {
  /** Can be set to true to check and log compilation and linking errors */
  static debug: boolean = false;
  /** The webgl context this Program belongs to */
  readonly gl: GLContext;

  /** The underlying webgl program */
  readonly program: WebGLProgram;
  /** The underlying webgl vertex shader */
  readonly vShader: WebGLShader;
  /** The underlying webgl fragment shader */
  readonly fShader: WebGLShader;

  /** The list of uniform & attribute names */
  protected dyns: string[];

  /** Whether the program is ready to use or not */
  ready: boolean;
  /** Unique id for the program */
  _uid: number;
  /** Unique id for the program that updates every time it is compiled */
  _cuid: number;

  [k: string]: any;

  /**
   * You can pass optional shader code to immediatly compile shaders or compile them later with {@link Program#compile}.
   * @param {GLContext} gl  The webgl context this Program belongs to
   * @param {String} [vert] The vertex shader code
   * @param {String} [frag] The fragment shader code
   * @param {String} [defs] A string to prepend to both fragment and vertex shader code
   */
  constructor(gl: GLContext, vert?: string, frag?: string, defs?: string) {
    this.gl = gl;
    this.program = <WebGLProgram>gl.createProgram();
    this.vShader = <WebGLShader>gl.createShader(gl.VERTEX_SHADER);
    this.fShader = <WebGLShader>gl.createShader(gl.FRAGMENT_SHADER);
    this.dyns = [];
    this.ready = false;
    gl.attachShader(this.program, this.vShader);
    gl.attachShader(this.program, this.fShader);

    this._uid = _UID++ | 0;
    this._cuid = _UID++ | 0;

    if (vert !== undefined && frag !== undefined) {
      this.compile(vert, frag, defs);
    }
  }

  /**
   * Bind the underlying webgl program.
   * Shortcut for `gl.useProgram()`.
   */
  use() {
    if (!this.ready) {
      this._grabParameters();
    }
    this.gl.useProgram(this.program);
  }

  /**
   * Alias for {@link Program#use}
   */
  bind() {
    this.use();
  }

  /**
   * Compile vertex and fragment shader, then link webgl program.
   * This method can be safely called several times.
   * @param {String} vert The vertex shader code
   * @param {String} frag The fragment shader code
   * @param {String} [prefix] A string to prepend to both fragment and vertex shader code
   */
  compile(vert: string, frag: string, prefix?: string ): boolean {
    this.ready = false;

    prefix = prefix === undefined ? '' : prefix + '\n';

    const gl = this.gl;

    if (!(compileShader(gl, this.fShader, prefix + frag) && compileShader(gl, this.vShader, prefix + vert))) {
      return false;
    }

    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      Program.debug && warn(gl.getProgramInfoLog(this.program));
      return false;
    }

    // delete old accessors
    while (this.dyns.length > 0) {
      delete this[<string>this.dyns.pop()];
    }

    this._cuid = _UID++ | 0;

    return true;
  }

  /**
   * Delete all webgl objects related to this Program.
   */
  dispose() {
    if (this.gl !== null) {
      this.gl.deleteProgram(this.program);
      this.gl.deleteShader(this.fShader);
      this.gl.deleteShader(this.vShader);
    }
  }

  /*
   *  List all uniforms and attributes and create helper function on Program instance
   *  for a uniform vec3 uDirection;
   *     create a method
   *        program.uDirection( 1, 0, 0 );
   */
  /**
   * List all uniforms and attributes and create a helper function for each on Program instance.
   *
   * @example
   * For a uniform
   * ```glsl
   * uniform vec3 uDirection;
   * ```
   * it creates a method
   * ```js
   * program.uDirection(1, 0, 0);
   * ```
   */
  _grabParameters() {
    const gl = this.gl,
      prg = this.program;

    const context: CompilationContext = {
      texIndex: 0,
      ublockIndex: 0,
    };

    // Uniforms
    // ========

    const numUniforms: number = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);

    for (var uniformIndex = 0; uniformIndex < numUniforms; ++uniformIndex) {
      var uniform = gl.getActiveUniform(prg, uniformIndex);

      // safari 8.0 issue,
      // when recompiling shader and link the progam again, old uniforms are kept in ACTIVE_UNIFORMS count but return null here
      if (uniform === null) {
        gl.getError(); // also flush error
        continue;
      }

      var uName = uniform.name,
        n = uName.indexOf('[');

      if (n >= 0) {
        uName = uName.substring(0, n);
      }

      var uLocation = gl.getUniformLocation(prg, uniform.name);

      // in Webgl2 location can be null here if uniform is member of a uniform block
      if (uLocation !== null) {
        this[uName] = getUniformSetter(uniform.type, uLocation, gl, context);
        this.dyns.push(uName);
      }
    }

    // Attributes
    // ==========

    const numAttribs = gl.getProgramParameter(prg, gl.ACTIVE_ATTRIBUTES);

    for (var aIndex = 0; aIndex < numAttribs; ++aIndex) {
      var attribName = (<WebGLActiveInfo>gl.getActiveAttrib(prg, aIndex)).name;
      var aLocation = gl.getAttribLocation(prg, attribName);
      this[attribName] = getAttribAccess(aLocation);
      this.dyns.push(attribName);
    }

    // UniformBlock
    // ============

    if (isWebgl2(gl)) {
      const numBlocks = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORM_BLOCKS);

      for (var blockIndex = 0; blockIndex < numBlocks; ++blockIndex) {
        var blockName = <string>gl.getActiveUniformBlockName(prg, blockIndex);
        this[blockName] = getUniformBufferSetFunction(blockIndex, gl, context);
        this.dyns.push(blockName);
      }
    }

    this.ready = true;
  }
}

/*
 * internal logs
 */
function warn(str: string|null) {
  console.warn(str);
}

// -------------------------------------------------
//                    UTILITIES
// -------------------------------------------------

/*
 * Shader logging utilities
 */

const __pads: Array<string> = ['', '   ', '  ', ' ', ''];

function appendLine(l: string, i: number): string {
  return __pads[String(i + 1).length] + (i + 1) + ': ' + l;
}

/*
 * Format shader code
 * add padded lines number
 */
function formatCode(shader: string): string {
  return shader
    .split('\n')
    .map(appendLine)
    .join('\n');
}

const ErrLineRegex = /^ERROR:\s?(\d+):(\d+)/

function reportCompileError( infos : string, source : string ){
  const sourceLines = source.split('\n');
  infos = infos.split('\n').map( (line)=>{
    const rr = ErrLineRegex.exec(line);
    if( rr ) { line += '\n  > ' + sourceLines[parseInt(rr[2])-1] }
    return line;
  }).join('\n');
  source = formatCode(source);

  warn( infos );
  warn( source );
}


/*
 * Shader compilation utility
 */
function compileShader(gl: GLContext, shader: WebGLShader, code: string): boolean {
  gl.shaderSource(shader, code);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    Program.debug && reportCompileError( gl.getShaderInfoLog(shader)!, code );
    return false;
  }

  return true;
}




const USetFMap: Record<string,string> = {};
USetFMap[String(5126) /*FLOAT       */] = '1f';
USetFMap[String(35664) /*FLOAT_VEC2  */] = '2f';
USetFMap[String(35665) /*FLOAT_VEC3  */] = '3f';
USetFMap[String(35666) /*FLOAT_VEC4  */] = '4f';
USetFMap[String(35670) /*BOOL        */] =
USetFMap[String(5124) /*INT         */] =
USetFMap[String(35678) /*SAMPLER_2D  */] = USetFMap[String(35680) /*SAMPLER_CUBE*/] =  USetFMap[String(35866) /*SAMPLER_2D_ARRAY*/] = '1i';
USetFMap[String(35671) /*BOOL_VEC2   */] = USetFMap[String(35667) /*INT_VEC2    */] = '2i';
USetFMap[String(35672) /*BOOL_VEC3   */] = USetFMap[String(35668) /*INT_VEC3    */] = '3i';
USetFMap[String(35673) /*BOOL_VEC4   */] = USetFMap[String(35669) /*INT_VEC4    */] = '4i';
USetFMap[String(35674) /*FLOAT_MAT2  */] = 'Matrix2f';
USetFMap[String(35675) /*FLOAT_MAT3  */] = 'Matrix3f';
USetFMap[String(35676) /*FLOAT_MAT4  */] = 'Matrix4f';

/*
 * Uniform upload utilities
 */

function getUniformSetFunctionName(type: number): string {
  return 'uniform' + USetFMap[String(type)];
}

/*
 * For a given uniform's type, return the proper setter function
 */
function getUniformSetter(type: number, location: WebGLUniformLocation, gl: GLContext, context: CompilationContext) {
  switch (type) {
    case gl.FLOAT_MAT2:
    case gl.FLOAT_MAT3:
    case gl.FLOAT_MAT4:
      return getMatrixSetFunction(type, location, gl, context);

    case gl.SAMPLER_2D:
    case gl.SAMPLER_CUBE:
    case 0x8b62: //gl.SAMPLER_2D_SHADOW:
    case 0x8b5f: //gl.SAMPLER_3D:
    case 0x8DC1: // gl.SAMPLER_2D_ARRAY:
      return getSamplerSetFunction(type, location, gl, context);

    default:
      return getUniformSetFunction(type, location, gl, context);
  }
}

/*
 * setter factory for vector uniforms
 * return a function wich take both array or arguments
 */
function getUniformSetFunction(
  type: number,
  location: WebGLUniformLocation,
  gl: GLContext,
  context: CompilationContext,
) {
  context;
  const fname = getUniformSetFunctionName(type);
  return function(...args: number[] | [Float32List]) {
    if (args.length === 1 && (args[0] as []).length != undefined ) {
      (gl as any)[fname + 'v'](location, args[0]);
    } else if (args.length > 0) {
      (gl as any)[fname](location, ...args);
    }
    return location;
  };
}

/*
 * setter factory for matrix uniforms
 */
function getMatrixSetFunction(
  type: number,
  location: WebGLUniformLocation,
  gl: GLContext,
  context: CompilationContext,
) {
  context;
  const fname = getUniformSetFunctionName(type);
  return function() {
    if (arguments.length > 0 && arguments[0].length !== undefined) {
      var transpose = arguments.length > 1 ? !!arguments[1] : false;
      (gl as any)[fname + 'v'](location, transpose, arguments[0]);
    }
    return location;
  };
}

/*
 * setter factory for sampler uniforms
 */
function getSamplerSetFunction(
  type: number,
  location: WebGLUniformLocation,
  gl: GLContext,
  context: CompilationContext,
) {
  const unit = context.texIndex++;
  return function() {
    if (arguments.length === 1) {
      if (arguments[0].bind !== undefined) {
        // is texture
        arguments[0].bind(unit);
        gl.uniform1i(location, unit);
      } else {
        gl.uniform1i(location, arguments[0]);
      }
    }
    return location;
  };
}

/*
 * setter factory for uniform buffers
 * can be
 *   f( buffer )
 *     buffer is bound to auto increment binding point unit and block binding reset to this point
 *   f( unit )
 *     only set the block binding point to given unit
 */
function getUniformBufferSetFunction(index: number, gl: WebGL2RenderingContext, context: CompilationContext) {
  const unit = context.ublockIndex++;
  return function( this: Program ) {
    if (arguments.length === 1) {
      if (arguments[0] instanceof WebGLBuffer) {
        // is buffer
        gl.uniformBlockBinding( this.program, index, unit);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, unit, arguments[0]);
      } else {
        gl.uniformBlockBinding( this.program, index, arguments[0]);
      }
    }
    return index;
  };
}

/*
 * getter factory for attributes
 */
function getAttribAccess(attrib:number) {
  return function() {
    return attrib;
  };
}


export default Program