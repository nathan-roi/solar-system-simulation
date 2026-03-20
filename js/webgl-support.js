export function getWebGL2Context( canvas ) {
  if ( !window.WebGL2RenderingContext ) {
    return null;
  }

  return canvas.getContext( 'webgl2', { antialias: true } );
}
