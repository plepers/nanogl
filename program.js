
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


var USetFMap = {};
USetFMap[ String(5126 ) /*FLOAT       */ ] = '1f';
USetFMap[ String(35664) /*FLOAT_VEC2  */ ] = '2f';
USetFMap[ String(35665) /*FLOAT_VEC3  */ ] = '3f';
USetFMap[ String(35666) /*FLOAT_VEC4  */ ] = '4f';
USetFMap[ String(35667) /*INT_VEC2    */ ] = '2i';
USetFMap[ String(35668) /*INT_VEC3    */ ] = '3i';
USetFMap[ String(35669) /*INT_VEC4    */ ] = '4i';
USetFMap[ String(35670) /*BOOL        */ ] = '1i';
USetFMap[ String(35671) /*BOOL_VEC2   */ ] = '2i';
USetFMap[ String(35672) /*BOOL_VEC3   */ ] = '3i';
USetFMap[ String(35673) /*BOOL_VEC4   */ ] = '4i';
USetFMap[ String(35674) /*FLOAT_MAT2  */ ] = 'Matrix2f';
USetFMap[ String(35675) /*FLOAT_MAT3  */ ] = 'Matrix3f';
USetFMap[ String(35676) /*FLOAT_MAT4  */ ] = 'Matrix4f';
USetFMap[ String(5124 ) /*INT         */ ] = '1i';
USetFMap[ String(35678) /*SAMPLER_2D  */ ] = '1i';
USetFMap[ String(35680) /*SAMPLER_CUBE*/ ] = '1i';

/**
 * Uniform upload utilities
 */

function getUniformSetFunctionName( type ){
  type = String(type);
  return 'uniform' + USetFMap[type];
}


function getUniformSetter( type, location, gl, context ){
  switch( type ){
    case gl.FLOAT_MAT2  :
    case gl.FLOAT_MAT3  :
    case gl.FLOAT_MAT4  :
      return getMatrixSetFunction( type, location, gl, context );

    case gl.SAMPLER_2D  :
    case gl.SAMPLER_CUBE:
      return getSamplerSetFunction( type, location, gl, context );

    default  :
      return getUniformSetFunction( type, location, gl, context );
  }
  return null;
}



function getUniformSetFunction( type, location, gl, context ){
  context;
  var fname = getUniformSetFunctionName( type );
  return function(){
    if( arguments.length === 1 && arguments[0].length !== undefined ){
      gl[fname+'v']( location, arguments[0] );
    } else if( arguments.length > 0) {
      gl[fname].apply( gl, Array.prototype.concat.apply( location, arguments) );
    }
    return location;
  };
}


function getMatrixSetFunction( type, location, gl, context ){
  context;
  var fname = getUniformSetFunctionName( type );
  return function(){
    if( arguments.length > 0 && arguments[0].length !== undefined ){
      gl[fname+'v']( location, !!arguments[1], arguments[0] );
    }
    return location;
  };
}


function getSamplerSetFunction( type, location, gl, context ){
  var unit = context.texIndex++;
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
    var context = {
      texIndex : 0
    };

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

      this[uName] = getUniformSetter( uniform.type, uLocation, gl, context );

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