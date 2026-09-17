import { init, set_code, test, wasm_memory } from 'engine';

const mem = wasm_memory();

set_code(`↯200_200_4 [⍥⚂×× 4 200 200]`);

const canvas = document.getElementById('game') as HTMLCanvasElement;

init();

function render() {
  const pixelResult = test();

  const pixels = new Uint8ClampedArray(mem.buffer, pixelResult.pixels_ptr(), pixelResult.pixels_len());

  const [width, height, _] = new Uint32Array(mem.buffer, pixelResult.shape_ptr(), pixelResult.shape_len());

  const imageData = new ImageData(pixels, width, height);

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.putImageData(imageData, 0, 0);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
