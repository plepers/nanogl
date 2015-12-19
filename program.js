
/**
 * Shader logging utilities
 */

var __pads = ['','   ','  ',' ',''];

function appendLine( l, i ){
  return __pads[String(i+1).length] + ( i+1 ) + ': ' + l;
}

/**
  * Add line numbers and log
  */
function logShader( shader ) {
  console.log( shader.split( '\n' ).map( appendLine ).join( '\n' ) );
}


/**
 * Uniform upload utilities
 */

function getUniformSetFunctionName( uniform, gl ){
  var p = 'uniform';
  switch( uniform.type ){
    case gl.FLOAT       : return p+'1f';
    case gl.FLOAT_VEC2  : return p+'2f';
    case gl.FLOAT_VEC3  : return p+'3f';
    case gl.FLOAT_VEC4  : return p+'4f';
    case gl.INT         : return p+'1i';
    case gl.INT_VEC2    : return p+'2i';
    case gl.INT_VEC3    : return p+'3i';
    case gl.INT_VEC4    : return p+'4i';
    case gl.BOOL        : return p+'1i';
    case gl.BOOL_VEC2   : return p+'2i';
    case gl.BOOL_VEC3   : return p+'3i';
    case gl.BOOL_VEC4   : return p+'4i';
    case gl.FLOAT_MAT2  : return p+'Matrix2f';
    case gl.FLOAT_MAT3  : return p+'Matrix3f';
    case gl.FLOAT_MAT4  : return p+'Matrix4f';
  }
  return null;
}

function getUniformSetFunction( uniform, gl ){
  var fname = getUniformSetFunctionName( uniform, gl );
  return function(){
    if( arguments.length === 1 && arguments[0].length !== undefined ){
      gl[fname+'v']( uniform.location, arguments[0] );
    } else {
      gl[fname].apply( gl, Array.prototype.concat.apply( uniform.location, arguments) );
    }
  }
}


/**
 * Program
 *   Compile opengl program and expose uniforms and attributes
 *   @gl : webgl context this program belongs to
 */
function Program( gl ){
  this.gl = gl;
  this.program = null;
  this.uniforms = {};
}

Program.prototype = {

  bind : function(){
    this.gl.useProgram( this.program );
  },

  compile : function( vert, frag, defs ){

    defs = ( defs || '' ) + '\n';

    var gl = this.gl,
        fShader, vShader,
        program;

    if( this.program ){
      gl.deleteProgram( this.program );
    }


    fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, defs + frag);
    gl.compileShader(fShader);

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(fShader));
      logShader( defs + frag );
      return false;
    }

    vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, defs + vert);
    gl.compileShader(vShader);

    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(vShader));
      logShader( defs + vert );
      return false;
    }

    program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      return false;
    }

    this.program = program;

    this.getParameters();

    return true;
  },

  getParameters : function(){
    var gl = this.gl;

    // Uniforms
    // ========

    var numUniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    var texIndex = 0;

    for ( var uniformIndex = 0; uniformIndex < numUniforms; ++uniformIndex)
    {
      var uniform = gl.getActiveUniform(this.program, uniformIndex);


      var uName = uniform.name,
          n     = uName.indexOf("["),
          aSize = 1;

      if( n >= 0 ){
        aSize = parseInt( uName.substring(n+1, uName.indexOf("]")));
        uName = uName.substring(0, n);
      }

      var uLocation = gl.getUniformLocation(this.program, uniform.name);


      var glUniform = {
        name : uName,
        location : uLocation,
        type : uniform.type,
        unit : 0,
        size : aSize
      }

      if( uniform.type == gl.SAMPLER_2D || uniform.type == gl.SAMPLER_CUBE )
      {
        glUniform.unit = texIndex++
        this.samplers[uName] = glUniform;
      }
      // this.params[uName] = uLocation;
      // this.uniforms.push( glUniform );
      this[uName] = getUniformSetFunction( glUniform, gl );
      this.uniforms[uName] = uLocation;


    }

    // Attributes
    // ==========

    var numAttribs = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);

    for (var aIndex = 0; aIndex < numAttribs; ++aIndex )
    {
      var attrib = gl.getActiveAttrib(this.program, aIndex);
      this[attrib.name] = gl.getAttribLocation(this.program, attrib.name);
    }
  }



};

module.exports = Program;