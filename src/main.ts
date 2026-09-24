import { init, render as render_fn, set_active_block, set_block_state, set_code, wasm_memory } from 'engine';

init();

const mem = wasm_memory();

function mod(n, d) {
  return ((n % d) + d) % d;
}

let x = 1;
let y = 1;
let z = 1;

(
  [
    ['btn-u', [1, 0, 0]],
    ['btn-d', [-1, 0, 0]],
    ['btn-f', [0, -1, 0]],
    ['btn-b', [0, 1, 0]],
    ['btn-l', [0, 0, -1]],
    ['btn-r', [0, 0, 1]],
  ] as [string, [number, number, number]][]
).forEach(([id, [dx, dy, dz]]) => {
  const button = document.getElementById(id) as HTMLButtonElement;
  button.addEventListener('click', () => {
    x = mod(x + dx, 5);
    y = mod(y + dy, 5);
    z = mod(z + dz, 5);
    set_active_block(x, y, z);
  });
});

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
voxels!(°⊸Scale 20 °⊸Camera 1_1_1 °⊸Fog Black)
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
