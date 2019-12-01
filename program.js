import { isWebgl2 } from './utils';
let _UID = 0;
class Program {
    constructor(gl, vert, frag, defs) {
        this.gl = gl;
        this.program = gl.createProgram();
        this.vShader = gl.createShader(gl.VERTEX_SHADER);
        this.fShader = gl.createShader(gl.FRAGMENT_SHADER);
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
    use() {
        if (!this.ready) {
            this._grabParameters();
        }
        this.gl.useProgram(this.program);
    }
    bind() {
        this.use();
    }
    compile(vert, frag, prefix) {
        this.ready = false;
        prefix = prefix === undefined ? '' : prefix + '\n';
        const gl = this.gl;
        if (!(compileShader(gl, this.fShader, prefix + frag) && compileShader(gl, this.vShader, prefix + vert))) {
            return false;
        }
        gl.linkProgram(this.program);
        if (Program.debug && !gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            warn(gl.getProgramInfoLog(this.program));
            return false;
        }
        while (this.dyns.length > 0) {
            delete this[this.dyns.pop()];
        }
        this._cuid = _UID++ | 0;
        return true;
    }
    dispose() {
        if (this.gl !== null) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteShader(this.fShader);
            this.gl.deleteShader(this.vShader);
        }
    }
    _grabParameters() {
        const gl = this.gl, prg = this.program;
        const context = {
            texIndex: 0,
            ublockIndex: 0,
        };
        const numUniforms = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORMS);
        for (var uniformIndex = 0; uniformIndex < numUniforms; ++uniformIndex) {
            var uniform = gl.getActiveUniform(prg, uniformIndex);
            if (uniform === null) {
                gl.getError();
                continue;
            }
            var uName = uniform.name, n = uName.indexOf('[');
            if (n >= 0) {
                uName = uName.substring(0, n);
            }
            var uLocation = gl.getUniformLocation(prg, uniform.name);
            if (uLocation !== null) {
                this[uName] = getUniformSetter(uniform.type, uLocation, gl, context);
                this.dyns.push(uName);
            }
        }
        const numAttribs = gl.getProgramParameter(prg, gl.ACTIVE_ATTRIBUTES);
        for (var aIndex = 0; aIndex < numAttribs; ++aIndex) {
            var attribName = gl.getActiveAttrib(prg, aIndex).name;
            var aLocation = gl.getAttribLocation(prg, attribName);
            this[attribName] = getAttribAccess(aLocation);
            this.dyns.push(attribName);
        }
        if (isWebgl2(gl)) {
            const numBlocks = gl.getProgramParameter(prg, gl.ACTIVE_UNIFORM_BLOCKS);
            for (var blockIndex = 0; blockIndex < numBlocks; ++blockIndex) {
                var blockName = gl.getActiveUniformBlockName(prg, blockIndex);
                this[blockName] = getUniformBufferSetFunction(blockIndex, gl, context);
                this.dyns.push(blockName);
            }
        }
        this.ready = true;
    }
}
Program.debug = false;
function warn(str) {
    console.warn(str);
}
const __pads = ['', '   ', '  ', ' ', ''];
function appendLine(l, i) {
    return __pads[String(i + 1).length] + (i + 1) + ': ' + l;
}
function formatCode(shader) {
    return shader
        .split('\n')
        .map(appendLine)
        .join('\n');
}
function compileShader(gl, shader, code) {
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (Program.debug && !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        warn(gl.getShaderInfoLog(shader));
        warn(formatCode(code));
        return false;
    }
    return true;
}
const USetFMap = {};
USetFMap[String(5126)] = '1f';
USetFMap[String(35664)] = '2f';
USetFMap[String(35665)] = '3f';
USetFMap[String(35666)] = '4f';
USetFMap[String(35670)] = USetFMap[String(5124)] = USetFMap[String(35678)] = USetFMap[String(35680)] = '1i';
USetFMap[String(35671)] = USetFMap[String(35667)] = '2i';
USetFMap[String(35672)] = USetFMap[String(35668)] = '3i';
USetFMap[String(35673)] = USetFMap[String(35669)] = '4i';
USetFMap[String(35674)] = 'Matrix2f';
USetFMap[String(35675)] = 'Matrix3f';
USetFMap[String(35676)] = 'Matrix4f';
function getUniformSetFunctionName(type) {
    return 'uniform' + USetFMap[String(type)];
}
function getUniformSetter(type, location, gl, context) {
    switch (type) {
        case gl.FLOAT_MAT2:
        case gl.FLOAT_MAT3:
        case gl.FLOAT_MAT4:
            return getMatrixSetFunction(type, location, gl, context);
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
        case 0x8b62:
        case 0x8b5f:
            return getSamplerSetFunction(type, location, gl, context);
        default:
            return getUniformSetFunction(type, location, gl, context);
    }
}
function getUniformSetFunction(type, location, gl, context) {
    context;
    const fname = getUniformSetFunctionName(type);
    return function (...args) {
        if (args.length === 1 && args[0].length != undefined) {
            gl[fname + 'v'](location, args[0]);
        }
        else if (args.length > 0) {
            gl[fname](location, ...args);
        }
        return location;
    };
}
function getMatrixSetFunction(type, location, gl, context) {
    context;
    const fname = getUniformSetFunctionName(type);
    return function () {
        if (arguments.length > 0 && arguments[0].length !== undefined) {
            var transpose = arguments.length > 1 ? !!arguments[1] : false;
            gl[fname + 'v'](location, transpose, arguments[0]);
        }
        return location;
    };
}
function getSamplerSetFunction(type, location, gl, context) {
    const unit = context.texIndex++;
    return function () {
        if (arguments.length === 1) {
            if (arguments[0].bind !== undefined) {
                arguments[0].bind(unit);
                gl.uniform1i(location, unit);
            }
            else {
                gl.uniform1i(location, arguments[0]);
            }
        }
        return location;
    };
}
function getUniformBufferSetFunction(index, gl, context) {
    const unit = context.ublockIndex++;
    return function () {
        if (arguments.length === 1) {
            if (arguments[0] instanceof WebGLBuffer) {
                gl.uniformBlockBinding(this.program, index, unit);
                gl.bindBufferBase(gl.UNIFORM_BUFFER, unit, arguments[0]);
            }
            else {
                gl.uniformBlockBinding(this.program, index, arguments[0]);
            }
        }
        return index;
    };
}
function getAttribAccess(attrib) {
    return function () {
        return attrib;
    };
}
export default Program;
