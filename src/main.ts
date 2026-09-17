import { init, set_code, test, wasm_memory } from 'engine';

init();

const mem = wasm_memory();

set_code(`# Experimental!
↯5_5_5_4 0
⍜⊢⋅1
[1_0_0 1_2_2 2_2_2 2_2_3 2_2_4]
[[1 1 1 1][1 1 1 1][1 0 0 0.3][0 1 0 0.3][0 1 1 0.3]]
∧⍜⊙⊡⊙◌
voxels!(°⊸Scale 20 °⊸Camera [1 (cos now) (∿ now)] °⊸Fog Black)
`);

const canvas = document.getElementById('game') as HTMLCanvasElement;

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
