var Promise = require( 'when/es6-shim/Promise.browserify-es6' );

var _loaders = {};

var TextureLoader = {};


function makeDefered(){
  if (typeof(Promise) != 'undefined' && Promise.defer) {
    return Promise.defer();
  } else {
    var res = {
      resolve : null,
      reject  : null
    };
    res.promise = new Promise(function(resolve, reject) {
      res.resolve = resolve;
      res.reject = reject;
    }.bind(res));
    Object.freeze(res);
    return res;
  }
}

/**
 *
 *
 *
 */
TextureLoader.load = function( texture, url ){
  releaseLoader( texture );

  var defer = makeDefered();

  var img = new Image();
  img.onload = function(){
    defer.resolve( texture );
  };
  img.onerror = function(){
    defer.reject( texture );
    releaseLoader( texture );
  };
  img.crossorigin = 'anonymous';
  img.src = url;

  _loaders[texture._uid] = {
    texture : texture,
    img : img,
    defer : defer
  };

  defer.promise.then( textureLoaded );
  return defer.promise;

};


function releaseLoader( texture ){
  var l = _loaders[texture._uid];
  if( l ){
    l.img.onload =
    l.img.onerror = null;
    l.img.src = '';
    l.defer.reject( texture );
  }
  delete _loaders[texture._uid];
}

function textureLoaded( texture ){
  texture.fromImage( _loaders[texture._uid].img );
  releaseLoader( texture );
  return texture;
}


module.exports = TextureLoader;