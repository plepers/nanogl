export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;

export function isWebgl2(context: GLContext): context is WebGL2RenderingContext {
  return (<WebGL2RenderingContext>context).fenceSync !== undefined;
}
