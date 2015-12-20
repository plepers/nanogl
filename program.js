
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

function getUniformSetFunctionName( type, gl ){
  var p = 'uniform';
  switch( type ){

    case gl.FLOAT       : return p+'1f';
    case gl.FLOAT_VEC2  : return p+'2f';
    case gl.FLOAT_VEC3  : return p+'3f';
    case gl.FLOAT_VEC4  : return p+'4f';

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

    case gl.INT         :
    case gl.SAMPLER_2D  :
    case gl.SAMPLER_CUBE: return p+'1i';
  }
  return null;
}


function getUniformSetFunction( type, location, gl ){
  var fname = getUniformSetFunctionName( type, gl );
  return function(){
    if( arguments.length === 1 && arguments[0].length !== undefined ){
      gl[fname+'v']( location, arguments[0] );
    } else if( arguments.length > 0) {
      gl[fname].apply( gl, Array.prototype.concat.apply( location, arguments) );
    }
    return location;
  };
}


function getSamplerSetFunction( type, location, gl, unit ){
  return function(){
    if( arguments.length === 1 ) {
      if( arguments[0].id !== undefined ){ // is texture
        gl.activeTexture( gl.TEXTURE0 + unit );
        gl.bindTexture( gl.TEXTURE_2D, arguments[0].id );
        gl.uniform1i( location, unit );
      } else {
        gl.uniform1i( location, arguments[0] );
      }
    }
    return location;
  };
}


function getAttribAccess( attrib ){
  return function(){
    return attrib;
  };
}

/**
 * Shader compilation utility
 */
function compileShader( gl, type, code ){
  var shader = gl.createShader( type );
  gl.shaderSource( shader, code );
  gl.compileShader( shader );

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    logShader( code );
    return null;
  }
  return shader;
}

/**
 * Program
 *   Compile opengl program and expose uniforms and attributes
 *   @gl : webgl context this program belongs to
 */
function Program( gl ){
  this.gl = gl;
  this.program = null;
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

    if (! (fShader = compileShader( gl, gl.FRAGMENT_SHADER, defs + frag ) ) ) {
      return false;
    }
    if (! (vShader = compileShader( gl, gl.VERTEX_SHADER,   defs + vert ) ) ) {
      return false;
    }

    program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    gl.deleteShader( vShader );
    gl.deleteShader( fShader );

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
      return false;
    }

    this.program = program;

    this._grabParameters();

    return true;
  },


  dispose : function() {
    this.gl.deleteProgram( this.program );
  },


  _grabParameters : function(){
    var gl = this.gl,
        prg = this.program;

    // Uniforms
    // ========

    var numUniforms = gl.getProgramParameter( prg, gl.ACTIVE_UNIFORMS );
    var texIndex = 0;

    for ( var uniformIndex = 0; uniformIndex < numUniforms; ++uniformIndex )
    {
      var uniform = gl.getActiveUniform( prg, uniformIndex );

      var uName   = uniform.name,
          n       = uName.indexOf('['),
          aSize   = 1;

      if( n >= 0 ){
        aSize = parseInt( uName.substring(n+1, uName.indexOf(']') ) );
        uName = uName.substring(0, n);
      }


      var uLocation = gl.getUniformLocation( prg, uniform.name );

      if( uniform.type === gl.SAMPLER_2D || uniform.type === gl.SAMPLER_CUBE )
      {
        this[uName] = getSamplerSetFunction( uniform.type, uLocation, gl, texIndex++ );
      } else {
        this[uName] = getUniformSetFunction( uniform.type, uLocation, gl );
      }


    }

    // Attributes
    // ==========

    var numAttribs = gl.getProgramParameter( prg, gl.ACTIVE_ATTRIBUTES );

    for (var aIndex = 0; aIndex < numAttribs; ++aIndex )
    {
      var attribName = gl.getActiveAttrib( prg, aIndex ).name;
      var aLocation  = gl.getAttribLocation( prg, attribName );
      gl.enableVertexAttribArray( aLocation );
      this[attribName] = getAttribAccess( aLocation );
    }
  }


};

module.exports = Program;