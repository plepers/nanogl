import { GLContext, isWebgl2 } from './types';

let _UID = 0;

const RENDERBUFFER = 0x8d41;

/**
 * @class
 * @classdesc RenderBuffer class manage renderbuffers
 *
 *  @param {WebGLRenderingContext} gl webgl context the texture belongs to
 *  @param {GLenum} [format=DEPTH_COMPONENT16] the pixel internal format, default to gl.DEPTH_COMPONENT16
 */
class RenderBuffer {

  readonly _uid: number
  readonly id: WebGLRenderbuffer

  private _maxSamples = 0
  private _samples = 0
  
  width  = 0
  height = 0


  constructor( readonly gl: GLContext, readonly format: GLenum = gl.DEPTH_COMPONENT16, msaaSamples = 0) {
    this._uid = _UID++;
    this.id = <WebGLRenderbuffer>gl.createRenderbuffer();
    this._maxSamples = isWebgl2(gl) ? gl.getParameter( gl.MAX_SAMPLES ):0
    this._samples = Math.min(msaaSamples, this._maxSamples);
  }

  
  /**
   * Set number of msaa samples
   * @param {number} samples set to 0 to disable msaa
   */
  public multisampling( samples:number ) {
    samples = Math.min(samples, this._maxSamples);
    if( this._samples !== samples){
      this._samples = samples;
      this._storage();
    }
  }


  /**
   * Allocate RenderBuffer storage
   * this method may leave RENDERBUFFER binding point empty
   * @param {number} width with of teh renderbuffer
   * @param {number} height height of the renderbuffer
   */
  allocate( width:number, height:number ) {
    if( this.width !== width || this.height !== height ) {
      this.width = width
      this.height = height
      this._storage()
    }
  }


  /**
   * Bind the renderbuffer
   */
  bind() {
    this.gl.bindRenderbuffer(RENDERBUFFER, this.id);
  }


  /**
   * delete the webgl renderbuffer
   */
  dispose() {
    this.gl.deleteRenderbuffer(this.id);
  }

  
  private _storage() {
    const gl = this.gl;
    gl.bindRenderbuffer(RENDERBUFFER, this.id);
    if( this._samples > 0 && isWebgl2(gl) ){
      gl.renderbufferStorageMultisample(RENDERBUFFER, this._samples, this.format, this.width, this.height);
    } else {
      gl.renderbufferStorage(RENDERBUFFER, this.format, this.width, this.height);
    }
    gl.bindRenderbuffer(RENDERBUFFER, null);
  }
}


export default RenderBuffer