import { init, render as render_fn, set_active_block, set_block_state, set_code, wasm_memory } from 'engine';

init();

const mem = wasm_memory();

function mod(n: number, d: number): number {
  return ((n % d) + d) % d;
}

let x = 1;
let y = 1;
let z = 1;

let r = 0;
let g = 0;
let b = 0;
let a = 0;

function updateColour() {
  r = (document.getElementById('colour-r') as HTMLInputElement).valueAsNumber;
  g = (document.getElementById('colour-g') as HTMLInputElement).valueAsNumber;
  b = (document.getElementById('colour-b') as HTMLInputElement).valueAsNumber;
  a = (document.getElementById('colour-a') as HTMLInputElement).valueAsNumber;
  (document.getElementById('colour-preview') as HTMLDivElement).style.backgroundColor =
    `rgba(${r}, ${g}, ${b}, ${a / 255})`;
}

['colour-r', 'colour-g', 'colour-b', 'colour-a'].forEach((id) => {
  const input = document.getElementById(id) as HTMLInputElement;
  input.addEventListener('input', updateColour);
});

updateColour();

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
    x = mod(x + dx, 10);
    y = mod(y + dy, 10);
    z = mod(z + dz, 10);
    set_active_block(x, y, z);
    console.log(x, y, z);
  });
});

document.getElementById('btn-place')?.addEventListener('click', () => {
  set_block_state(x, y, z, r, g, b, a);
});
document.getElementById('btn-erase')?.addEventListener('click', () => {
  set_block_state(x, y, z, 0, 0, 0, 0);
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

Pulse ← +0.4×0.2∿×2now

↯10_10_10_4 Blocks
⍜(⊡ X_Y_Z|⨬(×[1 1 1 Pulse]|[1 1 1 Pulse]◌)/×⊸=0)
voxels!(°⊸Scale 20 °⊸Camera 1_1_1 °⊸Fog Black)
`);

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
