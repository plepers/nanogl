/** A webgl rendering context. */
export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;

/**
 * Know whether the webgl context is webgl2 or not.
 * @param {GLContext} context The webgl context to test
 */
export function isWebgl2(context: GLContext): context is WebGL2RenderingContext {
  return (<WebGL2RenderingContext>context).fenceSync !== undefined;
}
