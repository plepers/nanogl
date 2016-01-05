Program
=======
Program class provide shader compilation and gl program linking functionality.
It also give you convinient access to active uniforms and attributes.


##exemple

##### Create a program
``` JavaScript
var Program = require( 'nanogl' ).Program;

// create a new Program with a given gl context
var prg = new Program( gl )

// compile program with code strings
prg.compile( vertexCode, fragmentCode );
```

##### play with uniforms
Once compiled, the Program object list all used uniforms and provide setter function for each one.

eg : for the following shader code `uniform vec3 uDirection;` it create a method `program.uDirection( 1, 0, 0 );`

Note that the program must be bound manually before using uniform setters.
> A uniform setter function support Array or TypedArray argument (`uniformNfv`)

> or, if not a matrix, values as arguments directly (`uniformNf`)

> setter functions return the uniform location, thus behave like getter when invoked with no arguments.

``` JavaScript
// /!\ program must be in use BEFORE uploading some uniforms
prg.use();

// set a mat4 uniform with a Float32Array or array
prg.uModelViewProjection( mvpMatrix );

// set a vec3 with separate arguments
prg.uColor( 1.0, 1.0, 1.0 )

// ... or (Typed)Array
prg.uColor( [1.0, 0.0, 1.0] )

// You can also access uniform's locations to manually do those stuff
// just call the setter without arguments.
gl.uniform3f( prg.uColor(), 1.0, 1.0, 1.0 );
```

##### play with samplers

Textures/samplers work like other uniforms, but in addition it also accept nanogl Textures as arguments.
``` JavaScript
prg.use();

// link GL_TEXTURE1 unit to uTexture ...
prg.uTexture( 1 );

// ... or directly provide a Texture instance
// in this case texture is bound, and assigned to the predefined unit for this sampler
prg.uTexture( myNanoglTexture );

// ... you can also get the uniforms location, and do the job manually
gl.uniform1i( prg.uTexture(), 1 );
```

##### play with attributes

``` JavaScript
// again, be sure program is in use before call related gl methods
prg.use();
gl.vertexAttribPointer( prg.aPosition(), 3, gl.FLOAT, ... );
//...

```


##### glsl code of the example above

```GLSL
attribute vec3 aPosition;

uniform mat4 uModelViewProjection;
uniform vec3 uColor;

uniform sampler2D uTexture;

void main(void){
  // ...
}
```
