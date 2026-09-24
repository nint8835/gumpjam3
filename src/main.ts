import { init, render as render_fn, set_block_state, set_code, wasm_memory } from 'engine';

init();

const mem = wasm_memory();

set_code(`# Experimental!
# Blocks ← ↯ 4000 0
# X      ← 1
# Y      ← 3
# Z      ← 4
Blocks ← GetBlocks
X      ← GetX
Y      ← GetY
Z      ← GetZ

↯5_5_5_4 Blocks
⍜(⊡ X_Y_Z|1_1_1_(+0.4×0.2∿×2now)◌)
voxels!(°⊸Scale 20 °⊸Camera 1_(cosnow)_(∿now) °⊸Fog Black)
`);

set_block_state(1, 2, 3, 1.0, 0.5, 1.0, 0.75);

const canvas = document.getElementById('game') as HTMLCanvasElement;

function render() {
  const pixelResult = render_fn();

  const pixels = new Uint8ClampedArray(mem.buffer, pixelResult.pixels_ptr(), pixelResult.pixels_len());

  const [width, height, _] = new Uint32Array(mem.buffer, pixelResult.shape_ptr(), pixelResult.shape_len());

  const imageData = new ImageData(pixels, width, height);

  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.putImageData(imageData, 0, 0);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
