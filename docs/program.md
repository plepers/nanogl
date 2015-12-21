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

Note that the program must be bound manually before using uniform setters.
> A uniform setter function support Array or TypedArray argument (`uniformNfv`)
> or values as arguments directly (`uniformNf`)

``` JavaScript
// /!\ program must be bound BEFORE uploading some uniforms
prg.bind();

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

##### play with attributes

``` JavaScript
// again, be sure program is bound before call related gl methods
prg.bind();
gl.vertexAttribPointer( prg.aPosition(), 3, gl.FLOAT, ... );
//...

```


##### glsl vertex code of the example above

```GLSL
attribute vec3 aPosition;

uniform mat4 uModelViewProjection;
uniform vec3 uColor;

void main(void){
  // ...
}
```
