
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
function formatCode( shader ) {
  shader.split( '\n' ).map( appendLine ).join( '\n' );
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
      if( arguments[0].bind !== undefined ){ // is texture
        arguments[0].bind( unit );
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
function compileShader( gl, shader, code ){
  gl.shaderSource( shader, code );
  gl.compileShader( shader );

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    Program.warn( gl.getShaderInfoLog(shader) );
    Program.warn( formatCode( code ) );
    return false;
  }
  return true;
}

/**
 * Program
 *   Compile opengl program and expose uniforms and attributes
 *   @gl : webgl context this program belongs to
 */
function Program( gl ){
  this.gl = gl;
  this.program = gl.createProgram();
  this.vShader = gl.createShader( gl.VERTEX_SHADER );
  this.fShader = gl.createShader( gl.FRAGMENT_SHADER );
  gl.attachShader(this.program, this.vShader);
  gl.attachShader(this.program, this.fShader);
}

/**
 * Program.verbose
 *   can be set to false to prevent shader code logs on glsl errors
 */
Program.verbose = true;



Program.prototype = {

  /**
   * Shortcut for gl.useProgram()
   * alias program.bind()
   */
  use : function(){
    this.gl.useProgram( this.program );
  },

  /**
   * Compile vertex and fragment shader then link program
   *  @vert :   string of vertex shader code
   *  @frag :   string of fragment shader code
   *  @prefix : an optional string append to both shaders
   */
  compile : function( vert, frag, prefix ){

    prefix = ( prefix || '' ) + '\n';

    var gl = this.gl;

    if( !( compileShader( gl, this.fShader, prefix + frag ) &&
           compileShader( gl, this.vShader, prefix + vert ) ) ) {
      return false;
    }

    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      Program.warn(gl.getProgramInfoLog(this.program));
      return false;
    }

    this._grabParameters();

    return true;
  },

  /**
    * Delete program and shader
    *
    */
  dispose : function() {
    this.gl.deleteProgram( this.program );
    this.gl.deleteShader(  this.Shader  );
    this.gl.deleteShader(  this.Shader  );
  },

  /**
   *  Internal
   *  List all uniforms and attributes and create helper function on Program instance
   *  eg :
   *     for a uniform vec3 uDirection;
   *     create a method
   *        program.uDirection( 1, 0, 0 );
   */
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

      // safari 8.0 issue,
      // when recompiling shader and link the progam again, old uniforms are kept in ACTIVE_UNIFORMS count but return null here
      if( uniform === null ){
        gl.getError(); // also flush error
        continue;
      }

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

// alias Program.use()
Program.prototype.bind = Program.prototype.use;



/**
 * internal logs
 *
 */
Program.warn = function(str){
  if( Program.verbose ){
    console.warn(str);
  }
};

module.exports = Program;