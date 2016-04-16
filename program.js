
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
function Program( gl, vert, frag, defs  ){
  this.gl = gl;
  this.program = gl.createProgram();
  this.vShader = gl.createShader( gl.VERTEX_SHADER );
  this.fShader = gl.createShader( gl.FRAGMENT_SHADER );
  this.dyns    = [];
  this.ready   = false;
  gl.attachShader(this.program, this.vShader);
  gl.attachShader(this.program, this.fShader);

  if( vert !== undefined && frag !== undefined ){
    this.compile( vert, frag, defs );
  }
}

/**
 * Program.debug
 *   can be set to true to check and log compilation and linking errors (default to false)
 */
Program.debug = true;



Program.prototype = {

  /**
   * Shortcut for gl.useProgram()
   * alias program.bind()
   */
  use : function(){
    if( !this.ready ){
      this._grabParameters();
    }
    this.gl.useProgram( this.program );
  },

  /**
   * Compile vertex and fragment shader then link gl program
   * This method can be safely called several times.
   *  @param {String} vert vertex shader code
   *  @param {String} frag fragment shader code
   *  @param {String} [prefix=''] an optional string append to both fragment and vertex code
   */
  compile : function( vert, frag, prefix ){
    this.ready   = false;

    prefix = ( prefix || '' ) + '\n';

    var gl = this.gl;

    if( !( compileShader( gl, this.fShader, prefix + frag ) &&
           compileShader( gl, this.vShader, prefix + vert ) ) ) {
      return false;
    }

    gl.linkProgram(this.program);

    if ( Program.debug && !gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      warn(gl.getProgramInfoLog(this.program));
      return false;
    }

    // delete old accessors
    while (this.dyns.length>0) {
      delete this[this.dyns.pop()];
    }

    return true;
  },

  /**
    * Delete program and shaders
    */
  dispose : function() {
    if( this.gl !== null ){
      this.gl.deleteProgram( this.program );
      this.gl.deleteShader(  this.fShader  );
      this.gl.deleteShader(  this.vShader  );
      this.gl = null;
    }
  },

  /*
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
          n       = uName.indexOf('[');

      if( n >= 0 ){
        uName = uName.substring(0, n);
      }

      var uLocation = gl.getUniformLocation( prg, uniform.name );
      this[uName] = getUniformSetter( uniform.type, uLocation, gl, context );
      this.dyns.push( uName );
    }

    // Attributes
    // ==========

    var numAttribs = gl.getProgramParameter( prg, gl.ACTIVE_ATTRIBUTES );

    for (var aIndex = 0; aIndex < numAttribs; ++aIndex )
    {
      var attribName = gl.getActiveAttrib( prg, aIndex ).name;
      var aLocation  = gl.getAttribLocation( prg, attribName );
      this[attribName] = getAttribAccess( aLocation );
      this.dyns.push( attribName );
    }

    this.ready   = true;
  }


};

/**
 * alias to Program.use()
 */
Program.prototype.bind = Program.prototype.use;



/*
 * internal logs
 */
function warn(str){
  console.warn(str);
}



// -------------------------------------------------
//                    UTILITIES
// -------------------------------------------------

/*
 * Shader logging utilities
 */

var __pads = ['','   ','  ',' ',''];

function appendLine( l, i ){
  return __pads[String(i+1).length] + ( i+1 ) + ': ' + l;
}

/*
 * Format shader code
 * add padded lines number
 */
function formatCode( shader ) {
  return shader.split( '\n' ).map( appendLine ).join( '\n' );
}

/*
 * Shader compilation utility
 */
function compileShader( gl, shader, code ){
  gl.shaderSource( shader, code );
  gl.compileShader( shader );

  if (Program.debug && !gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    warn( gl.getShaderInfoLog(shader) );
    warn( formatCode( code ) );
    return false;
  }

  return true;
}



var USetFMap = {};
USetFMap[ 5126  /*FLOAT       */ ] = '1f';
USetFMap[ 35664 /*FLOAT_VEC2  */ ] = '2f';
USetFMap[ 35665 /*FLOAT_VEC3  */ ] = '3f';
USetFMap[ 35666 /*FLOAT_VEC4  */ ] = '4f';
USetFMap[ 35670 /*BOOL        */ ] =
USetFMap[ 5124  /*INT         */ ] =
USetFMap[ 35678 /*SAMPLER_2D  */ ] =
USetFMap[ 35680 /*SAMPLER_CUBE*/ ] = '1i';
USetFMap[ 35671 /*BOOL_VEC2   */ ] =
USetFMap[ 35667 /*INT_VEC2    */ ] = '2i';
USetFMap[ 35672 /*BOOL_VEC3   */ ] =
USetFMap[ 35668 /*INT_VEC3    */ ] = '3i';
USetFMap[ 35673 /*BOOL_VEC4   */ ] =
USetFMap[ 35669 /*INT_VEC4    */ ] = '4i';
USetFMap[ 35674 /*FLOAT_MAT2  */ ] = 'Matrix2f';
USetFMap[ 35675 /*FLOAT_MAT3  */ ] = 'Matrix3f';
USetFMap[ 35676 /*FLOAT_MAT4  */ ] = 'Matrix4f';

/*
 * Uniform upload utilities
 */

function getUniformSetFunctionName( type ){
  type = String(type);
  return 'uniform' + USetFMap[type];
}

/*
 * For a given uniform's type, return the proper setter function
 */
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


/*
 * setter factory for vector uniforms
 * return a function wich take both array or arguments
 */
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

/*
 * setter factory for matrix uniforms
 */
function getMatrixSetFunction( type, location, gl, context ){
  context;
  var fname = getUniformSetFunctionName( type );
  return function(){
    if( arguments.length > 0 && arguments[0].length !== undefined ){
      var transpose = (arguments.length > 1) ? !!arguments[1] : false;
      gl[fname+'v']( location, transpose, arguments[0] );
    }
    return location;
  };
}

/*
 * setter factory for sampler uniforms
 */
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

/*
 * getter factory for attributes
 */
function getAttribAccess( attrib ){
  return function(){
    return attrib;
  };
}



module.exports = Program;